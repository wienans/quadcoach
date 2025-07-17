import { useTacticBoardCanvas } from "../../hooks/taticBoard/useTacticBoardCanvas";
import { useTacticBoardLayout } from "../../hooks/taticBoard/useTacticBoardLayout";
import { Box } from "@mui/material";

const FabricJsCanvas = (): JSX.Element => {
  const { setCanvasRef } = useTacticBoardCanvas();
  const { setContainerRef } = useTacticBoardLayout();

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
