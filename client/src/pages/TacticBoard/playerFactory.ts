import { v4 as uuidv4 } from "uuid";
import { PersonType } from "../../contexts/tacticBoard/TacticBoardFabricJsContext/types";
import {
  createExtendedCircle,
  createExtendedText,
  createExtendedGroup,
  setUuid,
  setObjectType,
  type FabricGroupWithUuid,
} from "../../contexts/tacticBoard/TacticBoardFabricJsContext/fabricTypes";

export const teamAInfo = {
  color: "#3d85c6",
};
export const teamBInfo = {
  color: "#dd2d2d",
};

const playerRadius = 15;
const playerTextOffset = 16;

export const getFabricPersonColor = (
  personType: PersonType,
): string | undefined => {
  switch (personType) {
    case PersonType.Beater:
      return "#000000";
    case PersonType.Chaser:
      return "#ffffff";
    case PersonType.Keeper:
      return "#03fc35";
    case PersonType.Seeker:
      return "#fcfc00";
  }
};

export type CreatePlayerOptions = {
  personType: PersonType;
  number: number;
  left: number;
  top: number;
  teamA: boolean;
};

// Build a player group (circle + number text) laid out at origin 0,0 with
// originX/originY "left"|"top"; the group itself carries the scene position.
// UUIDs and objectType are assigned. The group is returned without being added
// to the canvas, so callers stay in control of insertion.
export const createPlayer = (opts: CreatePlayerOptions): FabricGroupWithUuid => {
  const { personType, number, left, top, teamA } = opts;

  const circle = createExtendedCircle({
    radius: playerRadius,
    left: 0,
    top: 0,
    originX: "left",
    originY: "top",
    stroke: getFabricPersonColor(personType),
    strokeWidth: 3,
    fill: teamA ? teamAInfo.color : teamBInfo.color,
  });
  setUuid(circle, uuidv4());

  const text = createExtendedText(number.toString(), {
    left: playerTextOffset,
    top: playerTextOffset,
    fontFamily: "Arial",
    fontSize: 20,
    textAlign: "center",
    originX: "center",
    originY: "center",
  });
  setUuid(text, uuidv4());

  const group = createExtendedGroup([circle, text], {
    left,
    top,
    originX: "left",
    originY: "top",
    hasControls: false,
  });
  setUuid(group, uuidv4());
  setObjectType(group, teamA ? "playerA" : "playerB");

  return group;
};
