const dotenv = require("dotenv");
dotenv.config();

import AWS, { Textract, S3 } from "aws-sdk";
import { getKeyValues, getInterpretations } from "./textractKeyValues";

const config = require("./config");

AWS.config.update({
  accessKeyId: config.awsAccesskeyID,
  secretAccessKey: config.awsSecretAccessKey,
  region: config.awsRegion,
});

export const uploadToS3TextractAndSendResponse = (
  req,
  res,
  docBuffer,
  docName,
  docID,
  logger
) => {
  const textract = new Textract();
  const s3 = new S3();

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

  const s3params = {
    Bucket: `doc-classifier-bucket/${docID}`,
    Key: pngifiedDocName,
    Body: docBuffer,
  };

  let docClass = "";

  // All docs are uploaded just in case
  s3.upload(s3params, function (err, data) {
    if (err) {
      logger.error({ err }, "error uploading to s3");
    } else {
      textract.analyzeDocument(textractParams, (err, data) => {
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

        let keyValuePairs, interpretedKeys;
        try {
          keyValuePairs = getKeyValues(data);
          interpretedKeys = getInterpretations(keyValuePairs);
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
          });

          const jsonifiedDocName = req.files[0].originalname.replace(
            /(.(\w)+)$/gi,
            ".json"
          );

          const rawJSONs3Params = {
            Bucket: `doc-classifier-bucket/${docID}`,
            Key: `rawJSON-${jsonifiedDocName}`,
            Body: Buffer.from(JSON.stringify(data)),
          };

          s3.upload(rawJSONs3Params, (err, data) => {
            if (err) {
              logError("rawJSON S3 upload error", err);
            }
          });

          const parsedJSONs3Params = {
            Bucket: `doc-classifier-bucket/${docID}`,
            Key: `parsedJSON-${jsonifiedDocName}`,
            Body: Buffer.from(JSON.stringify(keyValuePairs)),
          };

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
