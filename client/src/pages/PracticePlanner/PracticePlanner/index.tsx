import React from "react";
import { Outlet } from "react-router-dom";

const PracticePlannerRoot: React.FC = () => {
  return <Outlet />;
};

export default PracticePlannerRoot;
export { default as ViewPracticePlanner } from "./ViewPracticePlanner";  
export { default as UpdatePracticePlanner } from "./UpdatePracticePlanner";