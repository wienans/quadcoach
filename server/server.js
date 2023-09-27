"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const exercise_1 = __importDefault(require("./models/exercise"));
const user_1 = __importDefault(require("./models/user"));
// Read out Port or use Default
const PORT = process.env.PORT || 3001;
// Start Express
const app = (0, express_1.default)();
// Connect to Mongo DB
console.warn(process.env.MONGO_USER);
console.warn(process.env.MONGO_PASSWORD);
console.warn(process.env.MONGO_DB);
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_DB = process.env.MONGO_DB;
const dbURI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@quadcoach-mongodb:27017/${MONGO_DB}?retryWrites=true&w=majority`;
mongoose_1.default.connect(dbURI)
    .then((result) => {
    console.log('connected to db'),
        app.listen(PORT, () => {
            console.log(`Server listening on ${PORT}`);
        });
})
    .catch((err) => console.log(err));
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.static('dist'));
// API's
app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});
app.post("/api/add-exercise", (req, res) => {
    let exercise = new exercise_1.default(req.body);
    exercise.save()
        .then((result) => {
        res.send(result);
    })
        .catch((err) => {
        console.log(err);
    });
});
app.get("/api/all-exercises", (req, res) => {
    exercise_1.default.find()
        .then((result) => {
        res.send(result);
    })
        .catch((err) => {
        console.log(err);
    });
});
app.post("/api/register", (req, res) => {
    let user = new user_1.default(req.body);
    user.save()
        .then((result) => {
        res.send(result);
    })
        .catch((err) => {
        res.send(err);
    });
});
app.get("/api/exercises", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exercises = yield exercise_1.default.find();
    if (exercises.length > 0) {
        res.send(exercises);
    }
    else {
        res.send(exercises);
    }
}));
app.delete("/api/exercise/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exercise_1.default.deleteOne({ _id: req.params.id });
    if (result) {
        res.send(result);
    }
    else {
        res.send({ "result": "No Record Found" });
    }
}));
app.get("/api/exercise/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exercise_1.default.findOne({ _id: req.params.id });
    if (result) {
        res.send(result);
    }
    else {
        res.send({ "result": "No Record Found" });
    }
}));
app.put("/api/exercise/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exercise_1.default.updateOne({ _id: req.params.id }, { $set: req.body });
    res.send(result);
}));
app.get("/api/search/:key", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exercise_1.default.find({
        "$or": [
            {
                name: { $regex: req.params.key },
            }
            // ,
            // {
            //   // name: { $regex: req.params.key },
            //   tags: { $regex: req.params.key },
            // }
        ]
    });
    if (result) {
        res.send(result);
    }
    else {
        res.send({ "result": "No Record Found" });
    }
}));
