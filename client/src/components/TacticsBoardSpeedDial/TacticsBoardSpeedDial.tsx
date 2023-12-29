import { useFabricJs } from "../FabricJsContext";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

export type TacticsBoardSpeedDialProps = {
  teamB: boolean;
  editMode: boolean;
  maxPlayers: number;
  setMaxPlayers: (maxPlayers: number) => void;
};
const colorTeamA: string = "purple";
const colorTeamB: string = "blue";
const TacticsBoardSpeedDial = ({
  teamB,
  editMode,
  maxPlayers,
  setMaxPlayers,
}: TacticsBoardSpeedDialProps): JSX.Element => {
  const { addObject, getAllObjectsJson } = useFabricJs();
  const handleAddPlayer = (headbandColor: string) => {
    const circle = new fabric.Circle({
      radius: 15,
      left: teamB ? 1220 - 250 - 30 : 250,
      top: 640,
      stroke: headbandColor, // Set the color of the stroke
      strokeWidth: 3, // Set the width of the stroke
      fill: teamB ? colorTeamB : colorTeamA,
      uuid: uuidv4(),
    });
    const text = new fabric.Text(maxPlayers.toString(), {
      left: teamB ? 1220 - 250 - 30 + 16 : 250 + 16,
      top: 640 + 16,
      fontFamily: "Arial",
      fontSize: 20,
      textAlign: "center",
      originX: "center",
      originY: "center",
      uuid: uuidv4(),
    });
    const group = new fabric.Group([circle, text], {
      uuid: uuidv4(),
      hasControls: false, // Disable resizing handles
    });
    setMaxPlayers(maxPlayers + 1);
    addObject(group);
    getAllObjectsJson();
  };
  const actions = [
    {
      icon: "C",
      name: "Chaser",
      headband: "#ffffff",
      onClick: handleAddPlayer,
    },
    {
      icon: "K",
      name: "Keeper",
      headband: "#03fc35",
      onClick: handleAddPlayer,
    },
    {
      icon: "B",
      name: "Beater",
      headband: "#000000",
      onClick: handleAddPlayer,
    },
    {
      icon: "S",
      name: "Seeker",
      headband: "#fcfc00",
      onClick: handleAddPlayer,
    },
  ];
  return (
    <div style={{ position: "relative" }}>
      <SpeedDial
        ariaLabel="SpeedDial"
        hidden={!editMode}
        sx={
          teamB
            ? { position: "absolute", bottom: 16, right: 16 }
            : { position: "absolute", bottom: 16, left: 16 }
        }
        icon={teamB ? "B" : "A"}
        FabProps={{
          sx: {
            bgcolor: teamB ? colorTeamB : colorTeamA,
            "&:hover": {
              bgcolor: "secondary.main",
            },
          },
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.onClick(action.headband);
            }}
          />
        ))}
      </SpeedDial>
    </div>
  );
};

export default TacticsBoardSpeedDial;
