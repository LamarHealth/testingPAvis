// const express = require("express");
// const bodyParser = require("body-parser");
// const path = require("path");
// const app = express();
// const port = process.env.PORT || 5000;

// // Load dotenv
// const dotenv = require("dotenv");
// dotenv.config();

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
// Routes
import "./fileUpload";

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
      console.log(req.files[0]);
      setTimeout(() => {
        res.json({
          status: "complete",
          docType: req.files[0].mimetype.split("/")[1],
          docName: req.files[0].originalname.split(".")[0],
          filePath: ""
        });
      }, 2000);
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
