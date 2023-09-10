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
console.warn(process.env.MONGO_USER)
console.warn(process.env.MONGO_PASSWORD)
console.warn(process.env.MONGO_DB)
const MONGO_USER = process.env.MONGO_USER
const MONGO_PASSWORD = process.env.MONGO_PASSWORD
const MONGO_DB = process.env.MONGO_DB

const dbURI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@quadcoach-mongodb:27017/${MONGO_DB}?retryWrites=true&w=majority`
mongoose.connect(dbURI)
  .then((result) => {
    console.log('connected to db'),
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

app.post("/api/add-exercise", (req, res) => {
  let exercise = new Exercise(req.body)
  exercise.save()
    .then((result) => {
      res.send(result)
    })
    .catch((err) => {
      console.log(err)
    })
})

app.get("/api/all-exercises", (req, res) => {
  Exercise.find()
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

app.post("/api/register", (req, res) => {
  let user = new User(req.body)
  user.save()
    .then((result) => {
      res.send(result)
    })
    .catch((err) => {
      res.send(err)
    })
})

app.get("/api/exercises", async (req, res) => {
  const exercises = await Exercise.find()
  if (exercises.length > 0) {
    res.send(exercises)
  } else {
    res.send(exercises)
  }
})

app.delete("/api/exercise/:id", async (req, res) => {
  const result = await Exercise.deleteOne({ _id: req.params.id })
  if (result) {
    res.send(result)
  } else {
    res.send({ "result": "No Record Found" })
  }
})

app.get("/api/exercise/:id", async (req, res) => {
  const result = await Exercise.findOne({ _id: req.params.id })
  if (result) {
    res.send(result)
  } else {
    res.send({ "result": "No Record Found" })
  }
})

app.put("/api/exercise/:id", async (req, res) => {
  const result = await Exercise.updateOne(
    { _id: req.params.id },
    { $set: req.body })
  res.send(result)
})

app.get("/api/search/:key", async (req, res) => {
  const result = await Exercise.find({
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
  })
  if (result) {
    res.send(result)
  } else {
    res.send({ "result": "No Record Found" })
  }
})