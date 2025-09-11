import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import cors from "cors";
import corsOptions from "./config/corsOptions";

import Exercise from "./models/exercise";
import TacticBoard from "./models/tacticboard";
import ExerciseList from "./models/exerciseLists";

import logger, { logEvents } from "./middleware/logger";
import errorHandler from "./middleware/errorHandler";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/userRoutes";
import tacticboardRoutes from "./routes/tacticboardRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import authRoutes from "./routes/authRoutes";
import path from "path";
import favoriteRoutes from "./routes/favoriteRoutes";
import practicePlanRoutes from "./routes/practicePlanRoutes";

// Read out Port or use Default
const PORT = process.env.PORT || 3001;

// Start Express
const app = express();

// Add this line before other middleware
app.set("trust proxy", 1);

// Connect to Mongo DB
console.warn(process.env.MONGO_USER);
console.warn(process.env.MONGO_DB);
const MONGO_USER = encodeURIComponent(process.env.MONGO_USER || "");
const MONGO_PASSWORD = encodeURIComponent(process.env.MONGO_PASSWORD || "");
const MONGO_DB = process.env.MONGO_DB;
const dbURI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@quadcoach-mongodb:27017/${MONGO_DB}?retryWrites=true&w=majority`;

app.use(express.static("dist"));

// Middleware
app.use(bodyParser.json({ limit: "1mb" }));
app.use(logger);
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(errorHandler);

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

// API's
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tacticboards", tacticboardRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/practice-plans", practicePlanRoutes);

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("/api/materials", async (req, res) => {
  let queryString: string = JSON.stringify(req.query);

  // Rebuild querry string
  queryString = queryString.replace(
    /\b(gte|gt|lte|lt|eq|ne|regex|options|in|nin)\b/g,
    (match) => `$${match}`
  );
  let querry = JSON.parse(queryString);
  // gets all distinct values of tags
  const result: string[] = await Exercise.distinct("materials");
  if (querry["materialName"] != undefined) {
    // Apply Regex, "i" for case insensitive
    let regex: RegExp = new RegExp(
      querry["materialName"]["$regex"],
      querry["materialName"]["$options"]
    );
    let filtered: string[] = result.filter((item) => item.match(regex));
    res.send(filtered);
  } else {
    res.send(result);
  }
});

app.get("/api/tags/exercises", async (req, res) => {
  let queryString: string = JSON.stringify(req.query);

  // Rebuild querry string
  queryString = queryString.replace(
    /\b(gte|gt|lte|lt|eq|ne|regex|options|in|nin)\b/g,
    (match) => `$${match}`
  );
  let querry = JSON.parse(queryString);
  // gets all distinct values of tags
  const result: string[] = await Exercise.distinct("tags");
  if (querry["tagName"] != undefined) {
    // Apply Regex, "i" for case insensitive
    let regex: RegExp = new RegExp(
      querry["tagName"]["$regex"],
      querry["tagName"]["$options"]
    );
    let filtered: string[] = result.filter((item) => item.match(regex));
    res.send(filtered);
  } else {
    res.send(result);
  }
});

app.get("/api/tags/tacticboards", async (req, res) => {
  let queryString: string = JSON.stringify(req.query);
  // Rebuild querry string
  queryString = queryString.replace(
    /\b(gte|gt|lte|lt|eq|ne|regex|options|in|nin)\b/g,
    (match) => `$${match}`
  );
  let querry = JSON.parse(queryString);
  // gets all distinct values of tags
  const result: string[] = await TacticBoard.distinct("tags");

  if (querry["tagName"] != undefined) {
    // Apply Regex, "i" for case insensitive
    let regex: RegExp = new RegExp(
      querry["tagName"]["$regex"],
      querry["tagName"]["$options"]
    );
    let filtered: string[] = result.filter((item) => item.match(regex));
    res.send(filtered);
  } else {
    res.send(result);
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
