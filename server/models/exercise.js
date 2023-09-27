"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const exerciseSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    video_url: {
        type: String
    },
    time_min: {
        type: Number
    },
    materials: {
        type: Array
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
        type: Array
    },
    coaching_points: {
        type: String
    },
    creator: {
        type: String
    }
}, { timestamps: true });
const Exercise = mongoose_1.default.model('exercises', exerciseSchema);
exports.default = Exercise;
