import {Schema,model,Types} from "mongoose";


interface IExercise {
    name: string;
    description: string;
    video_url?: string;
    time_min?: number;
    materials?: Types.Array<string>;
    beaters?: number;
    chaser?: number;
    persons?: number;
    tags?: Types.Array<string>;
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
        type: [String]
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
        type: [String]
    },
    coaching_points: {
        type: String
    },
    creator: {
        type: String
    }
}, { timestamps: true });

const Exercise = model<IExercise>('exercises', exerciseSchema);

export default Exercise;