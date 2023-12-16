import { useFabricJs } from "../FabricJsContext";
import { SoftTypography, SoftInput, SoftButton, SoftBox } from "..";
import { fabric } from "fabric";
const TacticsBoardToolBar = (): JSX.Element => {
  const { canvas, addObject } = useFabricJs();

  return (
    <div>
      <SoftButton
        onClick={() => {
          const rect = new fabric.Rect({
            width: 50,
            height: 50,
            left: 10,
            top: 10,
            fill: "blue",
          });
          addObject(rect);
        }}
      >
        Chaser
      </SoftButton>
      <SoftButton
        onClick={() => {
          console.log(JSON.stringify(canvas?.toJSON()));
        }}
      >
        Save
      </SoftButton>
    </div>
  );
};

export default TacticsBoardToolBar;
