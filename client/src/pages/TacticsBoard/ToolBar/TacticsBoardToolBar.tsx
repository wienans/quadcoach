import { useFabricJs } from "../../../components/FabricJsContext";
import {
  SoftTypography,
  SoftInput,
  SoftButton,
  SoftBox,
} from "../../../components";
import { fabric } from "fabric";
const TacticsBoardToolBar = (): JSX.Element => {
  const { addObject } = useFabricJs();
  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: "red",
    width: 20,
    height: 20,
    angle: 45,
  });
  return (
    <div>
      <SoftButton
        onClick={() => {
          addObject(rect);
        }}
      >
        Chaser
      </SoftButton>
    </div>
  );
};

export default TacticsBoardToolBar;
