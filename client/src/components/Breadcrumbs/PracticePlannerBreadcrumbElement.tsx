import { useTranslation } from "react-i18next";
import { UIMatch } from "react-router-dom";
import { useGetPracticePlanQuery } from "../../api/quadcoachApi/practicePlansApi";
import { RouteHandle } from "../../pages/routes/routeTypes";
import BreadcrumbElement from "./BreadcrumbElement";

export type PracticePlannerBreadcrumbElementProps = {
  route: UIMatch<unknown, RouteHandle>;
  isLastElement: boolean;
  light: boolean;
};

const PracticePlannerBreadcrumbElement = ({
  route,
  isLastElement,
  light,
}: PracticePlannerBreadcrumbElementProps): JSX.Element => {
  const { t } = useTranslation("Breadcrumbs");
  const { planId } = route.params;

  const { data: practicePlan, isLoading: isPracticePlanLoading } =
    useGetPracticePlanQuery(planId || "", {
      skip: planId == null,
    });

  return (
    <BreadcrumbElement
      isLastElement={isLastElement}
      isLoading={isPracticePlanLoading}
      title={practicePlan?.name ?? t("practicePlanner")}
      path={route.pathname}
      light={light}
    />
  );
};

export default PracticePlannerBreadcrumbElement;
