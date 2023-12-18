import { useFabricJs } from "../FabricJsContext";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

export type TacticsBoardSpeedDialProps = {
  editMode: boolean;
};

const TacticsBoardSpeedDial = ({
  editMode,
}: TacticsBoardSpeedDialProps): JSX.Element => {
  const { addObject } = useFabricJs();
  const handleAddBall = (ballColor: string) => {
    const circle = new fabric.Circle({
      radius: 10,
      stroke: "#000000", // Set the color of the stroke
      strokeWidth: 2, // Set the width of the stroke
      left: 600,
      top: 333,
      fill: ballColor,
      hasControls: false, // Disable resizing handles
      uuid: uuidv4(),
    });
    addObject(circle);
  };
  const actions = [
    {
      icon: "Q",
      name: "Quadball",
      headband: "#ffffff",
      onClick: handleAddBall,
    },
    {
      icon: "B",
      name: "Bludger",
      headband: "#fa5d02",
      onClick: handleAddBall,
    },
    {
      icon: "F",
      name: "Flag Runner",
      headband: "#fcfc00",
      onClick: handleAddBall,
    },
  ];
  return (
    <div style={{ position: "relative" }}>
      <SpeedDial
        ariaLabel="SpeedDial"
        hidden={!editMode}
        direction="down"
        sx={{ position: "absolute", top: 16, left: 16 }}
        icon={<SportsVolleyballIcon fontSize="medium" />}
        FabProps={{
          sx: {
            bgcolor: "#000000",
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
