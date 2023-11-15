import { forwardRef } from "react";
import SoftBox from "./SoftBox";

const SoftBoxForwardRef = forwardRef(SoftBox);

export default SoftBoxForwardRef;
export type { SoftBoxProps } from "./SoftBox";
export { GreyColors } from "./softBoxRootHelper";
