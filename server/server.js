// const express = require("express");
// const bodyParser = require("body-parser");
// const path = require("path");
// const app = express();
// const port = process.env.PORT || 5000;

// Load dotenv
const dotenv = require("dotenv");
dotenv.config();

import gm from "gm";

import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import AWS, { S3 } from "aws-sdk";
import uuidv4 from "uuid";
import { getLinesGeometry } from "./textractKeyValues";
import { uploadToS3TextractAndSendResponse } from "./uploadDoc";
const pino = require("pino");
const expressPino = require("express-pino-logger");

// Routes
// AWS
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

const app = express();

// pino logging
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  prettyPrint: process.env.PINO_PRETTY === "true" ? true : false,
});

const expressLogger = expressPino({ logger });

// can disable this if don't want every request/response logged to console
app.use(expressLogger);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const router = express.Router();

const staticFiles = express.static(path.join(__dirname, "../../client/build"));
app.use(staticFiles);
app.use(cors());

// POST upload doc, get kvps
// var upload = multer({ storage: multer.memoryStorage() }).any();
router.post("/api/upload_status", (req, res) => {
  // Currently doesn't save anywhere
  var upload = multer({}).any();
  upload(req, res, () => {
    if (req) {
      const docName = req.files[0].originalname;
      const docID = uuidv4();
      const docBuffer = req.files[0].buffer;

      // handle pdf
      if (!req.files[0].mimetype.includes("image")) {
        gm(docBuffer, "DOC_NAME.pdf") // 2nd argument is so that gm() can infer a filetype. DOC_NAME isn't actually a doc name
          .density(600, 600)
          .toBuffer("PNG", (err, buffer) => {
            if (err) {
              logger.error(
                { err },
                "error converting pdf to png using gm/graphicsmagick"
              );

              return;
            } else {
              logger.info(`${docName}.pdf successfully converted`);
              uploadToS3TextractAndSendResponse(
                req,
                res,
                buffer,
                docName,
                docID,
                logger
              );
            }
          });

        // handle png
      } else {
        uploadToS3TextractAndSendResponse(
          req,
          res,
          docBuffer,
          docName,
          docID,
          logger
        );
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

  const s3 = new S3(s3Config);

  const s3GetParams = {
    Bucket: config.bucketName,
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
  const docJsonURI = `${docID}/${rawJSONDocName}`;

  const s3 = new S3(s3Config);

  const s3rawJSONParams = {
    Bucket: config.bucketName,
    Key: docJsonURI,
  };

  s3.getObject(s3rawJSONParams, (error, data) => {
    if (error) {
      logger.error(
        {
          docID,
          docName: req.params.docName,
          rawJSONDocName: rawJSONDocName,
          s3Key: docJsonURI,
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
