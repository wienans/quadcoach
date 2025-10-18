import mongoose from "mongoose";
import { logEvents } from "./middleware/logger";
import app from "./app";

// Read out Port or use Default
const PORT = process.env.PORT || 3001;

// Connect to Mongo DB
const MONGO_USER = encodeURIComponent(process.env.MONGO_USER || "");
const MONGO_PASSWORD = encodeURIComponent(process.env.MONGO_PASSWORD || "");
const MONGO_DB = process.env.MONGO_DB;
const MONGO_HOST = process.env.MONGO_HOST || "mongodb";
const dbURI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:27017/${MONGO_DB}?retryWrites=true&w=majority`;

// Static + other middleware already configured in app.ts

// Middleware already applied in app.ts

mongoose
  .connect(dbURI)
  .then((result) => {
    console.log("connected to db"),
      app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`);
      });
  })
  .catch((err) => {
    console.log(err);
    logEvents(
      `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
      "mongoErrLog.log"
    );
  });

