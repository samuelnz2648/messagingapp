// messagingapp/backend/config/express.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

module.exports = (app) => {
  // Create a write stream (in append mode)
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "../access.log"),
    { flags: "a" }
  );

  // Define custom Morgan tokens
  morgan.token("user", (req) => (req.user ? req.user.username : "anonymous"));
  morgan.token("error", (req, res, error) =>
    error ? `Error: ${error.message}` : ""
  );
  morgan.token("socket", (req) => (req.socket ? req.socket.id : ""));

  // Custom Morgan format
  const morganFormat =
    ":method :url :status :res[content-length] - :response-time ms :user :socket :error";

  // Setup the logger to write to both file and console
  app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => {
          accessLogStream.write(message); // Write to file
          console.log(message.trim()); // Write to console
        },
      },
    })
  );

  app.use(cors());
  app.use(express.json());
  app.use(helmet());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });
  app.use("/api", limiter);
};
