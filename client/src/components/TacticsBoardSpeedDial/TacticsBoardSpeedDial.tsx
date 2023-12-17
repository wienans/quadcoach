import { useFabricJs } from "../FabricJsContext";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import { fabric } from "fabric";

export type TacticsBoardSpeedDialProps = {
  teamB: boolean;
  editMode: boolean;
};
const colorTeamA: string = "purple";
const colorTeamB: string = "blue";
const TacticsBoardSpeedDial = ({
  teamB,
  editMode,
}: TacticsBoardSpeedDialProps): JSX.Element => {
  const { addObject } = useFabricJs();
  const handleAddPlayer = (headbandColor: string) => {
    const circle = new fabric.Circle({
      radius: 15,
      left: teamB ? 1220 - 250 - 30 : 250,
      top: 640,
      stroke: headbandColor, // Set the color of the stroke
      strokeWidth: 3, // Set the width of the stroke
      fill: teamB ? colorTeamB : colorTeamA,
      hasControls: false, // Disable resizing handles
    });
    addObject(circle);
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
