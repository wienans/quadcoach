const express = require("express");

const mongoose = require("mongoose");
const Exercise = require("./models/exercise")

const PORT = process.env.PORT || 3001;

const app = express();

const DB_USER = process.env.DB_USER.toString();
const DB_PASS = process.env.DB_PASS.toString();

const dbURI = `mongodb://${DB_USER}:${DB_PASS}@127.0.0.1:27017/quadcoach?retryWrites=true&w=majority`;
mongoose.connect(dbURI)
  .then((result) => {
    console.log('connectedres.js to db'), 
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
      })
    })
  .catch((err) => console.log(err));

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
  });

app.get("/add-exercise", (req, res) => {
  const exercise = new Exercise({
    name: "New Exercise",
    description: "This is a test Exercise",
    persons: 5
  });
  exercise.save()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/all-exercises", (req, res) => {
  Exercise.find()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    })
});

app.get("/single-exercise", (req, res) => {
  Exercise.findById("64f33b729276228054ac1695")
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    })
});