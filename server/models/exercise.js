const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
    name: {
        type: String,
        requiered: true
    },
    description: {
        type: String,
        requiered: true
    },
    video_url: {
        type: String
    },
    time_min: {
        type: Number
    },
    materials: {
        type: String
    },
    beaters: {
        type: Number
    },
    chaser: {
        type: Number
    },
    persons: {
        type: Number
    },
    tags: {
        type: String
    },
    coaching_points: {
        type: String
    }
},{timestamps: true});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;