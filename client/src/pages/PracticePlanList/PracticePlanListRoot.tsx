/**
 * Practice Plan list Page is parent of practice plan page in route hierarchy and all pages should be separated pages.
 * So if outlet is available, it is practice plan page and should be shown instead of practice plan list page.
 */

import { useOutlet } from "react-router-dom";
import PracticePlanList from "./PracticePlanList";

const PracticePlanListRoot = (): JSX.Element => {
  const outlet = useOutlet();

  if (outlet) {
    return outlet;
  }

  return <PracticePlanList />;
};

export default PracticePlanListRoot;