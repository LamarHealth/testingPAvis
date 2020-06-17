// const express = require("express");
// const bodyParser = require("body-parser");
// const path = require("path");
// const app = express();
// const port = process.env.PORT || 5000;

// // Load dotenv
const dotenv = require("dotenv");
dotenv.config();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// // API calls
// app.get("/api/hello", (req, res) => {
//   res.send({ express: "Hello From Express" });
// });
// app.post("/api/world", (req, res) => {
//   console.log(req.body);
//   res.send(
//     `I received your POST request. This is what you sent me: ${req.body.post}`
//   );
// });
// if (process.env.NODE_ENV === "production") {
//   // Serve any static files
//   app.use(express.static(path.join(__dirname, "client/build")));
//   // Handle React routing, return all requests to React app
//   app.get("*", function(req, res) {
//     res.sendFile(path.join(__dirname, "client/build", "index.html"));
//   });
// }
// app.listen(port, () => console.log(`Listening on port ${port}`));

import bodyParser from "body-parser";
import express from "express";
import path from "path";
import multer from "multer";
import AWS, { Textract, SageMakerRuntime, S3 } from "aws-sdk";
import fs from "fs";
import uuidv4 from "uuid";
import { parseTextract } from "./textractParser";
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
      const sagemakerruntime = new SageMakerRuntime();
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

      var s3params = {
        Bucket: "doc-classifier-bucket",
        Key: req.files[0].originalname,
        Body: req.files[0].buffer,
      };

      let docClass = "";

      s3.upload(s3params, function (err, data) {
        console.log(err, data);

        textract.analyzeDocument(textractParams, (err, data) => {
          if (err) {
            console.log(err, err.stack);
            res.status(400).send({
              status: "error",
              docID: uuidv4(),
              docType: req.files[0].mimetype.split("/")[1],
              docClass: docClass,
              docName: req.files[0].originalname.split(".")[0],
              filePath: "",
              keyValuePairs: "NA",
            });
          }
          // an error occurred
          else {
            res.json({
              status: "complete",
              docID: uuidv4(),
              docType: req.files[0].mimetype.split("/")[1],
              docClass: docClass,
              docName: req.files[0].originalname.split(".")[0],
              filePath: "",
              keyValuePairs: parseTextract(data),
            });
          } // successful response
        });
      });
    } else {
      setTimeout(() => {
        res.console.error("Could not process document");
      }, 2000);
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
