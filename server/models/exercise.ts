import mongoose from "mongoose";
const Schema = mongoose.Schema;

interface IExercise {
    name: string;
    description: string;
    video_url?: string;
    time_min?: number;
    materials?: string[];
    beaters?: number;
    chaser?: number;
    persons?: number;
    tags?: string[];
    coaching_points?: string;
    creator?: string;
}

const exerciseSchema = new Schema<IExercise>({
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

const Exercise = mongoose.model<IExercise>('exercises', exerciseSchema);

export default Exercise;