
const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const adminRoute = require("./routes/admin-route");
const voterRoute = require("./routes/voter-route");
const ErrorHandler = require("./controllers/error-controller");
const ErrorObject = require("./utils/error");
const { PORT } = process.env;

const app = express();
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);


// Middlewares

// body parser
app.use(express.json());

// Cors
app.use(cors());

// Using Static files
app.use(express.static(`${__dirname}/public`));

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

// Route

app.use("/api/v1/admins", adminRoute);
app.use("/api/v1", voterRoute);

app.all("*", (req, res, next) => {
  const err = new ErrorObject(
    `${req.protocol}://${req.get("host")}${req.url} not found`, 404);
  next(err);
});

// Error Handling
app.use(ErrorHandler);
module.exports = app;
