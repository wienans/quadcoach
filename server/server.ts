import express from "express";
import mongoose from "mongoose";

import cors from "cors";
import corsOptions from "./config/corsOptions";

import Exercise from "./models/exercise";
import User from "./models/user";
import TacticBoard from "./models/tacticboard";

import logger, { logEvents } from "./middleware/logger";
import errorHandler from "./middleware/errorHandler";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/userRoutes";
import tacticboardRoutes from "./routes/tacticboardRoutes";

// Read out Port or use Default
const PORT = process.env.PORT || 3001;

// Start Express
const app = express();

// Connect to Mongo DB
console.warn(process.env.MONGO_USER);
console.warn(process.env.MONGO_PASSWORD);
console.warn(process.env.MONGO_DB);
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_DB = process.env.MONGO_DB;

const dbURI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@quadcoach-mongodb:27017/${MONGO_DB}?retryWrites=true&w=majority`;

// Middleware
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
app.use("/api/tacticboards", tacticboardRoutes);
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.post("/api/add-exercise", async (req, res) => {
  let exercise = new Exercise(req.body);
  const result = await exercise.save();
  if (!result) {
    console.error("Couldn't create Exercise");
  }
  res.send(result);
});

app.get("/api/exercises", async (req, res) => {
  let queryString: string = JSON.stringify(req.query);

  queryString = queryString.replace(
    /\b(gte|gt|lte|lt|eq|ne|regex|options|in|nin)\b/g,
    (match) => `$${match}`
  );

  const exercises = await Exercise.find(JSON.parse(queryString));

  res.send(exercises);
});

app.delete("/api/exercise/:id", async (req, res) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const result = await Exercise.deleteOne({ _id: req.params.id });
    if (result) {
      res.send(result);
    } else {
      res.send({ result: "No Record Found" });
    }
  } else {
    res.send({ result: "No Record Found" });
  }
});

app.get("/api/exercise/:id", async (req, res) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const result = await Exercise.findOne({ _id: req.params.id });
    if (result) {
      res.send(result);
    } else {
      res.send({ result: "No Record Found" });
    }
  } else {
    res.send({ result: "No Record Found" });
  }
});

app.get("/api/exercise/:id/relatedExercises", async (req, res) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const exerciseToGetRealted = await Exercise.findOne({
      _id: req.params.id,
    }).exec();
    if (!exerciseToGetRealted) {
      res.send({ result: "No Record Found" });
      return;
    }

    if (
      !exerciseToGetRealted.related_to ||
      exerciseToGetRealted.related_to.length === 0
    ) {
      res.send([]);
      return;
    }

    const result = await Exercise.find({
      $or: exerciseToGetRealted.related_to.map((r) => ({ _id: r._id })),
    });
    if (result) {
      res.send(result);
    } else {
      res.send({ result: "No Record Found" });
    }
  } else {
    res.send({ result: "No Record Found" });
  }
});

app.put("/api/exercise/:id", async (req, res) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const result = await Exercise.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.send(result);
  } else {
    res.send({ result: "No Record Found" });
  }
});

app.get("/api/search/:key", async (req, res) => {
  const result = await Exercise.find({
    $or: [
      {
        name: { $regex: req.params.key },
      },
      // ,
      // {
      //   // name: { $regex: req.params.key },
      //   tags: { $regex: req.params.key },
      // }
    ],
  });
  if (result) {
    res.send(result);
  } else {
    res.send({ result: "No Record Found" });
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
