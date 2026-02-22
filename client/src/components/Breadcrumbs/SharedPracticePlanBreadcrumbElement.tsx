import { useTranslation } from "react-i18next";
import { UIMatch } from "react-router-dom";
import { useGetSharedPracticePlanQuery } from "../../api/quadcoachApi/practicePlansApi";
import { RouteHandle } from "../../pages/routes/routeTypes";
import BreadcrumbElement from "./BreadcrumbElement";

export type SharedPracticePlanBreadcrumbElementProps = {
  route: UIMatch<unknown, RouteHandle>;
  isLastElement: boolean;
  light: boolean;
};

const SharedPracticePlanBreadcrumbElement = ({
  route,
  isLastElement,
  light,
}: SharedPracticePlanBreadcrumbElementProps): JSX.Element => {
  const { t } = useTranslation("Breadcrumbs");
  const { token } = route.params;

  const { data: practicePlan, isLoading: isPracticePlanLoading } =
    useGetSharedPracticePlanQuery(token || "", {
      skip: token == null,
    });

  return (
    <BreadcrumbElement
      isLastElement={isLastElement}
      isLoading={isPracticePlanLoading}
      title={practicePlan?.name ?? t("Breadcrumbs:sharedPracticePlan")}
      path={route.pathname}
      light={light}
    />
  );
};

export default SharedPracticePlanBreadcrumbElement;
