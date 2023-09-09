const express = require("express")

const mongoose = require("mongoose")
const cors = require("cors")

const Exercise = require("./models/exercise")
const User = require("./models/user")
// Read out Port or use Default
const PORT = process.env.PORT || 3001

// Start Express
const app = express()

// Connect to Mongo DB
const DB_USER = process.env.DB_USER.toString()
const DB_PASS = process.env.DB_PASS.toString()

const dbURI = `mongodb://${DB_USER}:${DB_PASS}@127.0.0.1:27017/quadcoach?retryWrites=true&w=majority`
mongoose.connect(dbURI)
  .then((result) => {
    console.log('connectedres.js to db'),
      app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`)
      })
  })
  .catch((err) => console.log(err))

// Middleware
app.use(express.json())
app.use(cors())
// API's
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" })
})

app.post("/add-exercise", (req, res) => {
  let exercise = new Exercise(req.body)
  exercise.save()
    .then((result) => {
      res.send(result)
    })
    .catch((err) => {
      console.log(err)
    })
})

app.get("/all-exercises", (req, res) => {
  Exercise.find()
    .then((result) => {
      res.send(result)
    })
    .catch((err) => {
      console.log(err)
    })
})

app.get("/single-exercise", (req, res) => {
  Exercise.findById("64f33b729276228054ac1695")
    .then((result) => {
      res.send(result)
    })
    .catch((err) => {
      console.log(err)
    })
})

app.get("/", (req, res) => {
  res.send("app is working...")
})

app.post("/register", (req, res) => {
  let user = new User(req.body)
  user.save()
    .then((result) => {
      res.send(result)
    })
    .catch((err) => {
      res.send(err)
    })
})

app.get("/exercises", async (req, res) => {
  const exercises = await Exercise.find()
  if (exercises.length > 0) {
    res.send(exercises)
  } else {
    res.send({ result: "No Exercises found" })
  }
})

app.delete("/exercise/:id", async (req, res) => {
  const result = await Exercise.deleteOne({ _id: req.params.id })
  if (result) {
    res.send(result)
  } else {
    res.send({ "result": "No Record Found" })
  }
})

app.get("/exercise/:id", async (req, res) => {
  const result = await Exercise.findOne({ _id: req.params.id })
  if (result) {
    res.send(result)
  } else {
    res.send({ "result": "No Record Found" })
  }
})

app.put("/exercise/:id", async (req, res) => {
  const result = await Exercise.updateOne(
    { _id: req.params.id },
    { $set: req.body })
  res.send(result)
})