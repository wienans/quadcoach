import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import corsOptions from "./config/corsOptions";
import logger from "./middleware/logger";
import errorHandler from "./middleware/errorHandler";

import userRoutes from "./routes/userRoutes";
import tacticboardRoutes from "./routes/tacticboardRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import authRoutes from "./routes/authRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import practicePlanRoutes from "./routes/practicePlanRoutes";
import Exercise from "./models/exercise";
import TacticBoard from "./models/tacticboard";

const app = express();
app.set("trust proxy", 1);

app.use(express.static("dist"));
app.use(bodyParser.json({ limit: "1mb" }));
app.use(logger);
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Existing APIs
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tacticboards", tacticboardRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/practice-plans", practicePlanRoutes);

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

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Keep error handler last so it catches route errors
app.use(errorHandler);

export default app;
