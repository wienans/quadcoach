import { IconButton, Tooltip } from "@mui/material";
import { SoftBox } from "../../../components";
import LayersIcon from "@mui/icons-material/Layers";

const TacticBoardTopItemsMenu = (): JSX.Element => {
  return (
    <SoftBox
      sx={{
        bgcolor: "background.paper",
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "center",
        // height: "40px",
      }}
    >
      <SoftBox
        sx={{
          bgcolor: "background.paper",
          display: "flex",
          mx: 1,
          alignItems: "center",
          height: "100%",
        }}
      >
        <Tooltip title="blub">
          <IconButton size="small">
            <LayersIcon />
          </IconButton>
        </Tooltip>
      </SoftBox>
    </SoftBox>
  );
};

export default TacticBoardTopItemsMenu;
