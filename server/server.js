// const express = require("express");
// const bodyParser = require("body-parser");
// const path = require("path");
// const app = express();
// const port = process.env.PORT || 5000;

// Load dotenv
const dotenv = require("dotenv");
dotenv.config();

import bodyParser from "body-parser";
import express from "express";
import path from "path";
import multer from "multer";
import AWS, { Textract, SageMakerRuntime, S3 } from "aws-sdk";
import uuidv4 from "uuid";
import { getKeyValues, getLinesGeometry } from "./textractKeyValues";
import cors from "cors";

// Routes

// AWS
const config = require("./config");

AWS.config.update({
  accessKeyId: config.awsAccesskeyID,
  secretAccessKey: config.awsSecretAccessKey,
  region: config.awsRegion,
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const router = express.Router();

const staticFiles = express.static(path.join(__dirname, "../../client/build"));

app.use(staticFiles);

// TODO: Run this through Textract
// var upload = multer({ storage: multer.memoryStorage() }).any();
router.post("/api/upload_status", (req, res) => {
  // Currently doesn't save anywhere
  var upload = multer({}).any();
  upload(req, res, () => {
    if (req) {
      const textract = new Textract();
      const s3 = new S3();
      var textractParams = {
        Document: {
          /* required */
          Bytes: req.files[0].buffer,
        },
        FeatureTypes: [
          /* required */
          "FORMS",
          /* TABLES */
        ],
      };

      const docID = uuidv4();

      // convert .pdf file extension to .png cause that is what the client is doing to it
      let pngifiedDocName = req.files[0].originalname.replace(
        /(.pdf)$/i,
        ".png"
      );

      var s3params = {
        Bucket: `doc-classifier-bucket/${docID}`,
        Key: pngifiedDocName,
        Body: req.files[0].buffer,
      };

      let docClass = "";
      // All docs are uploaded just in case
      s3.upload(s3params, function (err, data) {
        textract.analyzeDocument(textractParams, (err, data) => {
          if (err) {
            console.log(err, err.stack);
            res.status(400).send({
              status: "error",
              docID: docID,
              docType: req.files[0].mimetype.split("/")[1],
              docClass: docClass,
              docName: req.files[0].originalname.split(".")[0],
              filePath: "",
              keyValuePairs: "NA",
            });
          }
          // an error occurred
          else {
            const parsedTextract = getKeyValues(data);

            res.json({
              status: "complete",
              docID: docID,
              docType: req.files[0].mimetype.split("/")[1],
              docClass: docClass,
              docName: req.files[0].originalname.split(".")[0],
              filePath: "",
              keyValuePairs: parsedTextract,
            });
            // successful response

            // upload the JSON
            const jsonifiedDocName = req.files[0].originalname.replace(
              /(.(\w)+)$/gi,
              ".json"
            );

            // rawJSON
            s3params = {
              Bucket: `doc-classifier-bucket/${docID}`,
              Key: `rawJSON-${jsonifiedDocName}`,
              Body: Buffer.from(JSON.stringify(data)),
            };

            s3.upload(s3params, (err, data) => {
              if (err) {
                console.log("rawJSON s3 upload error: ", err);
              }
            });

            // parsedJSON
            s3params = {
              Bucket: `doc-classifier-bucket/${docID}`,
              Key: `parsedJSON-${jsonifiedDocName}`,
              Body: Buffer.from(JSON.stringify(parsedTextract)),
            };

            s3.upload(s3params, (err, data) => {
              if (err) {
                console.log("parsedJSON s3 upload error: ", err);
              }
            });
          }
        });
      });
    } else {
      setTimeout(() => {
        res.console.error("Could not process document");
      }, 2000);
    }
  });
});

// GET doc images from S3, send to client
router.get("/api/doc-image/:docID/:docName", (req, res) => {
  const docID = req.params.docID.trim();
  const docName = req.params.docName.trim();

  console.log("docID:", docID);
  console.log("docName:", docName);

  const s3 = new S3();

  const s3GetParams = {
    Bucket: "doc-classifier-bucket",
    Key: `${docID}/${docName}`,
  };

  s3.getObject(s3GetParams, (error, data) => {
    if (error) {
      console.error("error getting doc image from S3: ", error);
      res.status(400).send({
        status: "error",
        docID: req.params.docID,
        docName: req.params.docName,
        rawJSONDocName: rawJSONDocName,
      });
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

  const s3 = new S3();

  const s3rawJSONParams = {
    Bucket: "doc-classifier-bucket",
    Key: `${docID}/${rawJSONDocName}`,
  };

  s3.getObject(s3rawJSONParams, (error, data) => {
    if (error) {
      console.log("error getting raw JSON file from S3: ", error);
      res.status(400).send({
        status: "error",
        docID: req.params.docID,
        docName: req.params.docName,
        rawJSONDocName: rawJSONDocName,
      });
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

router.get("/api/hello", (req, res) => {
  res.json({ express: "Hello From Express" });
});

router.post("/api/timedpost", (req, res) => {
  let waitedResponse;
  setTimeout(() => {
    console.log("sdflsjkdfjkls");
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
  console.log(`Listening on ${app.get("port")}`);
});
