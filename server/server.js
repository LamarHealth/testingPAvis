// const express = require("express");
// const bodyParser = require("body-parser");
// const path = require("path");
// const app = express();
// const port = process.env.PORT || 5000;

// Load dotenv
const dotenv = require("dotenv");
dotenv.config();

import fs from "fs";
const { exec } = require("child_process");

import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import AWS, { Textract, S3 } from "aws-sdk";
import uuidv4 from "uuid";
import {
  getKeyValues,
  getInterpretations,
  getLinesGeometry,
} from "./textractKeyValues";
const pino = require("pino");
const expressPino = require("express-pino-logger");

// Routes
// AWS
const config = require("./config");

AWS.config.update({
  accessKeyId: config.awsAccesskeyID,
  secretAccessKey: config.awsSecretAccessKey,
  region: config.awsRegion,
});

const app = express();

// pino logging
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  prettyPrint: process.env.PINO_PRETTY === "true" ? true : false,
});
const expressLogger = expressPino({ logger });

// can disable this if don't want every request/response logged to console
// app.use(expressLogger);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const router = express.Router();

const staticFiles = express.static(path.join(__dirname, "../../client/build"));
app.use(staticFiles);
app.use(cors());

// TODO: Run this through Textract
// var upload = multer({ storage: multer.memoryStorage() }).any();
router.post("/api/upload_status", (req, res) => {
  // Currently doesn't save anywhere
  var upload = multer({}).any();
  upload(req, res, () => {
    if (req) {
      const docName = req.files[0].originalname;
      const docID = uuidv4();
      const docBuffer = req.files[0].buffer;

      const textract = new Textract();
      const s3 = new S3();

      //////// UPLOAD FUNCTION //////////
      const uploadToS3TextractAndSendResponse = (docBuffer) => {
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

        var s3params = {
          Bucket: `doc-classifier-bucket/${docID}`,
          Key: pngifiedDocName,
          Body: docBuffer,
        };

        let docClass = "";

        // All docs are uploaded just in case
        s3.upload(s3params, function (err, data) {
          textract.analyzeDocument(textractParams, (err, data) => {
            const keyValuePairs = getKeyValues(data);
            const interpretedKeys = getInterpretations(keyValuePairs);

            // helper functions
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

              let s3params = {
                Bucket: `doc-classifier-bucket/${docID}`,
                Key: `rawJSON-${jsonifiedDocName}`,
                Body: Buffer.from(JSON.stringify(data)),
              };

              s3.upload(s3params, (err, data) => {
                if (err) {
                  logError("rawJSON S3 upload error", err);
                }
              });

              s3params = {
                Bucket: `doc-classifier-bucket/${docID}`,
                Key: `parsedJSON-${jsonifiedDocName}`,
                Body: Buffer.from(JSON.stringify(keyValuePairs)),
              };

              s3.upload(s3params, (err, data) => {
                if (err) {
                  logError("parsedJSON s3 upload error", err);
                }
              });
            };

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
                    logger.info(
                      `throttling exception resolved after ${n} tries`
                    );
                    sendSuccessfulResponse();
                  }
                });
              }
            };

            // handle errors
            if (err) {
              logError("S3.upload error", err);
              // throttling exception
              if (err.code === "ThrottlingException") {
                logger.info("S3 throttling exception detected. Trying again.");
                delayedUpload(1, 15);
              } else {
                sendError(400, "error");
              }
            } else {
              // success
              sendSuccessfulResponse();
            }
          });
        });
      };

      //////// HANDLE PDF //////////
      if (!req.files[0].mimetype.includes("image")) {
        const deleteFiles = () => {
          fs.unlink(`temp_files/${docID}.png`, (err) => {
            if (err) logger.error(err);
          });
          fs.unlink(`temp_files/${docID}.pdf`, (err) => {
            if (err) logger.error(err);
          });
        };

        fs.writeFile(`temp_files/${docID}.pdf`, docBuffer, (err) => {
          if (err) logger.error(err);
          else {
            exec(
              `magick convert -density 300 temp_files/${docID}.pdf -quality 100 temp_files/${docID}.png`,
              (error, stdout, stderr) => {
                if (error) {
                  logger.error(
                    { msg: error.message },
                    `error convering pdf using image magick`
                  );
                  deleteFiles();
                  return;
                }
                if (stderr) {
                  logger.error(
                    { stderr },
                    `STDERR converting pdf using image magick`
                  );
                }
                fs.readFile(`temp_files/${docID}.png`, (err, data) => {
                  if (err) {
                    deleteFiles();
                    logger.error(err);
                  }

                  // check if > 5MB
                  fs.stat(`temp_files/${docID}.png`, (err, stats) => {
                    if (err) {
                      deleteFiles();
                      logger.error(err);
                    } else {
                      const pngSize = stats["size"] / 1000000;
                      if (pngSize < 5) {
                        deleteFiles();
                        uploadToS3TextractAndSendResponse(Buffer.from(data));
                      } else {
                        deleteFiles();
                        logger.error("png size > 5MB");
                        res.status(405).send({
                          status:
                            "file size exceeds 5MB, cannot parse with textract",
                          docID: docID,
                          docType: req.files[0].mimetype.split("/")[1],
                          docClass: docClass,
                          docName: req.files[0].originalname.split(".")[0],
                          filePath: "",
                          keyValuePairs: "NA",
                        });
                      }
                    }
                  });
                });
              }
            );
          }
        });
        //////// HANDLE PNG //////////
      } else {
        uploadToS3TextractAndSendResponse(docBuffer);
      }
    } else {
      logger.error("Could not process document. Multer error.", req.body);
    }
  });
});

// GET doc images from S3, send to client
router.get("/api/doc-image/:docID/:docName", (req, res) => {
  const docID = req.params.docID.trim();
  const docName = req.params.docName.trim();

  const s3 = new S3();

  const s3GetParams = {
    Bucket: "doc-classifier-bucket",
    Key: `${docID}/${docName}`,
  };

  s3.getObject(s3GetParams, (error, data) => {
    if (error) {
      logger.error(
        {
          docID,
          docName,
          route: "/api/doc-image/",
          type: "GET",
          s3error: error,
        },
        "error getting doc image from S3"
      );
      switch (error.code) {
        case "NoSuchKey":
          res.status(410).send({
            status:
              "Document could not be found on the server. Please try re-uploading your document and trying again.",
            docID: req.params.docID,
            docName: req.params.docName,
          });
          break;
        default:
          res.status(400).send({
            status: "error",
            docID: req.params.docID,
            docName: req.params.docName,
          });
      }
    } else {
      const justTheData = data.Body;

      res.send(justTheData);
    }
  });
});

// GET rawJSON from S3, send parsed lines and geometry to client
router.get("/api/lines-geometry/:docID/:docName", (req, res) => {
  const docID = req.params.docID.trim();
  const rawJSONDocName = `rawJSON-${req.params.docName.trim()}.json`;
  const s3Key = `${docID}/${rawJSONDocName}`;

  const s3 = new S3();

  const s3rawJSONParams = {
    Bucket: "doc-classifier-bucket",
    Key: s3Key,
  };

  s3.getObject(s3rawJSONParams, (error, data) => {
    if (error) {
      logger.error(
        {
          docID,
          docName: req.params.docName,
          rawJSONDocName: rawJSONDocName,
          s3Key,
          route: "/api/lines-geometry/",
          type: "GET",
          s3error: error,
        },
        "error getting raw JSON file from S3"
      );
      switch (error.code) {
        case "NoSuchKey":
          res.status(410).send({
            status:
              "Document could not be found on the server. Please try re-uploading your document and trying again.",
            docID: req.params.docID,
            docName: req.params.docName,
            rawJSONDocName: rawJSONDocName,
          });
          break;
        default:
          res.status(400).send({
            status: "error",
            docID: req.params.docID,
            docName: req.params.docName,
            rawJSONDocName: rawJSONDocName,
          });
      }
    } else {
      const rawJSON = JSON.parse(data.Body);
      const parsedLinesGeometry = getLinesGeometry(rawJSON);

      res.json({
        docName: req.params.docName,
        docID: req.params.docID,
        rawJSONDocName: rawJSONDocName,
        linesGeometry: parsedLinesGeometry,
      });
    }
  });
});

// POST remove KV pair
router.post("/api/report-kv-pair/:docID/:docName", (req, res) => {
  const docID = req.params.docID.trim();
  const docName = req.params.docName.trim();
  const faultyKVPair = req.body;

  logger.info({ docID, docName, faultyKVPair }, "Faulty KV pair received.");

  res.status(202).send({
    status:
      "Your note has been received. We have flagged this key / value pair as faulty and will work to be more accurate in the future.",
    docID,
    docName,
    faultyKVPair,
  });
});

router.get("/api/hello", (req, res) => {
  res.json({ express: "Hello From Express" });
});

router.post("/api/timedpost", (req, res) => {
  let waitedResponse;
  setTimeout(() => {
    logger.info("sdflsjkdfjkls");
    // waitedResponse = { express: "Hello From Express" + `File: ${req.name}` };
    res.json({ express: "Hello From Express" + `File: ${req.name}` });
  }, 3000);
  // res.json(waitedResponse);
});

app.use(router);

// any routes not picked up by the server api will be handled by the react router
app.use("/*", staticFiles);

app.set("port", process.env.PORT || 3001);
app.listen(app.get("port"), () => {
  logger.info(`Listening on ${app.get("port")}`);
});
