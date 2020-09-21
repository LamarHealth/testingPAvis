const dotenv = require("dotenv");
dotenv.config();

import AWS, { Textract, S3 } from "aws-sdk";
import {
  getKeyValues,
  getInterpretations,
  getLinesOnly,
} from "./textractKeyValues";

const config = require("./config");

const textractConfig = {
  accessKeyId: config.awsAccesskeyID,
  secretAccessKey: config.awsSecretAccessKey,
  region: config.awsRegion,
};
const s3Config = {
  accessKeyId: config.bucketAccessKeyID,
  secretAccessKey: config.bucketSecretAccessKey,
  region: config.awsRegion,
};

export const uploadToS3TextractAndSendResponse = (
  req,
  res,
  docBuffer,
  docName,
  docID,
  logger
) => {
  const textract = new Textract(textractConfig);
  const s3 = new S3(s3Config);

  // helper functions
  const sendError = (errorCode, statusMessage) => {
    res.status(errorCode).send({
      status: statusMessage,
      docID: docID,
      docType: req.files[0].mimetype.split("/")[1],
      docClass: docClass,
      docName: req.files[0].originalname.split(".")[0],
      filePath: "",
      keyValuePairs: "NA",
    });
  };

  const logError = (msg, error = "") => {
    logger.error(
      {
        docID,
        pngifiedDocName,
        route: "/api/upload_status/",
        type: "POST",
        error: error,
      },
      msg
    );
  };

  var textractParams = {
    Document: {
      /* required */
      Bytes: docBuffer,
    },
    FeatureTypes: [
      /* required */
      "FORMS",
      /* TABLES */
    ],
  };

  // convert .pdf file extension to .png it's no longer a pdf
  let pngifiedDocName = docName.replace(/(.pdf)$/i, ".png");

  const s3PngUploadparams = {
    Bucket: `${config.bucketName}/${docID}`,
    Key: pngifiedDocName,
    Body: docBuffer,
  };

  let docClass = "";

  // liberty config
  // All docs are uploaded just in case
  s3.upload(s3PngUploadparams, function (err, data) {
    logger.info(`${docName} uploaded to s3`);
    if (err) {
      logError("error uploading to s3", err);
      sendError(500, "error uploading to s3");
    } else {
      // docit config
      textract.analyzeDocument(textractParams, (err, data) => {
        logger.info(`${docName} analyzed by textract`);
        let keyValuePairs, interpretedKeys, lines;
        try {
          keyValuePairs = getKeyValues(data);
          interpretedKeys = getInterpretations(keyValuePairs);
          lines = getLinesOnly(data);
          logger.info("successfully parsed textract");
        } catch (err) {
          logError("error parsing textract data, ", err);
        }

        const sendSuccessfulResponse = () => {
          res.json({
            status: "complete",
            docID: docID,
            docType: req.files[0].mimetype.split("/")[1],
            docClass: docClass,
            docName: req.files[0].originalname.split(".")[0],
            filePath: "",
            keyValuePairs,
            interpretedKeys,
            lines,
          });

          const jsonifiedDocName = req.files[0].originalname.replace(
            /(.(\w)+)$/gi,
            ".json"
          );

          const rawJSONs3Params = {
            Bucket: `${config.bucketName}/${docID}`,
            Key: `rawJSON-${jsonifiedDocName}`,
            Body: Buffer.from(JSON.stringify(data)),
          };

          // liberty config
          s3.upload(rawJSONs3Params, (err, data) => {
            if (err) {
              logError("rawJSON S3 upload error", err);
            }
          });

          const parsedJSONs3Params = {
            Bucket: `${config.bucketName}/${docID}`,
            Key: `parsedJSON-${jsonifiedDocName}`,
            Body: Buffer.from(JSON.stringify(keyValuePairs)),
          };
          // liberty config
          s3.upload(parsedJSONs3Params, (err, data) => {
            if (err) {
              logError("parsedJSON s3 upload error", err);
            }
          });
        };

        const delayedUpload = (n, maxN) => {
          if (n > maxN) {
            logError(
              `Max tries error: ${n} tries`,
              `Throttling exception max tries exceeded after ${n} tries. Request failed.`
            );
            sendError(
              429,
              "Throttling exception, max tries exceeded. request failed."
            );
          } else {
            // docit config
            textract.analyzeDocument(textractParams, (err, data) => {
              if (err) {
                if (err.code === "ThrottlingException") {
                  logger.info(
                    `Throttling exception detected. Trying again x${n + 1}.`
                  );
                  return setTimeout(
                    () => delayedUpload(n + 1, maxN),
                    Math.pow(2, n)
                  );
                } else {
                  logError(
                    "Some other error after a throttling exception",
                    err
                  );
                  sendError(500, "internal server error");
                }
              } else {
                logger.info(`throttling exception resolved after ${n} tries`);
                sendSuccessfulResponse();
              }
            });
          }
        };

        // handle errors
        if (err) {
          logError("textract upload error", err);
          // throttling exception
          if (err.code === "ThrottlingException") {
            logger.info("throttling exception detected. Trying again.");
            delayedUpload(1, 15);
          } else {
            sendError(400, "error");
          }
        } else {
          // success
          sendSuccessfulResponse();
        }
      });
    }
  });
};
