import { useTacticBoardFabricJs } from "../../hooks";
import { Box } from "@mui/material";

const FabricJsCanvas = (): JSX.Element => {
  const { setCanvasRef, setContainerRef } = useTacticBoardFabricJs();

  return (
    <Box
      ref={setContainerRef}
      sx={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        display: "flex",
      }}
    >
      <canvas ref={setCanvasRef} />
    </Box>
  );
};

export default FabricJsCanvas;
