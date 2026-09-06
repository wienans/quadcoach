import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import corsOptions from "./config/corsOptions";
import logger from "./middleware/logger";
import errorHandler from "./middleware/errorHandler";

import userRoutes from "./routes/userRoutes";
import tacticBoardRoutes from "./routes/tacticBoardRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import authRoutes from "./routes/authRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import practicePlanRoutes from "./routes/practicePlanRoutes";
import {
  getExerciseMaterials,
  getExerciseTags,
} from "./controllers/exerciseController";
import { getTacticBoardTags } from "./controllers/tacticBoardController";
import verifyJWTOptional from "./middleware/verifyJWTOptional";

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
app.use("/api/tacticboards", tacticBoardRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/practice-plans", practicePlanRoutes);

app.get("/api/materials", getExerciseMaterials);

app.get("/api/tags/exercises", getExerciseTags);

app.get("/api/tags/tacticboards", verifyJWTOptional, getTacticBoardTags);

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Keep error handler last so it catches route errors
app.use(errorHandler);

export default app;
