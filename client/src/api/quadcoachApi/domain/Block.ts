import { TacticBoard } from ".";

type Block = {
  _id: string;
  video_url?: string;
  description?: string;
  coaching_points?: string;
  tactics_board?: string;
  tacticboard: TacticBoard;
  time_min: number;
};

export default Block;
