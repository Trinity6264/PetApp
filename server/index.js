const express = require("express");
const app = express();
const morgan = require("morgan");
const dbSetup = require("./db/db_setup");
const router = require("./routes/user_route");
const errorHandler = require("./middleware/error_handler");
const notFound = require("./middleware/not_found");
require("dotenv").config();

// port from environment variable
const PORT = process.env.PORT || 8080;

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/api/v1/user", router);
app.use(errorHandler);
app.use(notFound);

const startServer = async () => {
  try {
    await dbSetup(process.env.URI);
    app.listen(PORT, console.log(`Server listening on port: ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

startServer();
