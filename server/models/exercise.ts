import {Schema,model,Types} from "mongoose";


interface IBlock {
    video_url?: string;
    description?: string;
    coaching_points?: string;
    tactics_board?: Types.ObjectId;
    time_min?: number;
}

interface IExercise {
    name: string;
    description?: string; // unused for block model only backwards compatible
    video_url?: string; // unused for block model only backwards compatible
    time_min?: number; // unused for block model only backwards compatible
    materials?: Types.Array<string>;
    beaters?: number;
    chaser?: number;
    persons: number;
    tags?: Types.Array<string>;
    coaching_points?: string; // unused for block model only backwards compatible
    creator?: string;
    description_blocks?: Types.DocumentArray<IBlock>;
    related_to?: Types.Array<Types.ObjectId>;
}

const blockSchema = new Schema<IBlock>({
    video_url: {
        type: String
    },
    description:{
        type: String
    },
    coaching_points: {
        type: String
    },
    tactics_board: {
        type: Types.ObjectId,
        ref: 'tacticBoards'
    },
    time_min: {
        type: Number
    }
})

const exerciseSchema = new Schema<IExercise>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
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
        type: Number,
        required: true
    },
    tags: {
        type: [String]
    },
    coaching_points: {
        type: String
    },
    creator: {
        type: String
    },
    description_blocks: {
        type: [blockSchema]
    },
    related_to: {
        type: [Types.ObjectId],
        ref: 'exercises'
    },
}, { timestamps: true });

const Exercise = model<IExercise>('exercises', exerciseSchema);

export default Exercise;