import { UIMatch } from "react-router-dom";
import { RouteHandle, RouteHandleType } from "../../pages/routes/routeTypes";
import { useTranslation } from "react-i18next";
import ExerciseBreadcrumbElement from "./ExerciseBreadcrumbElement";
import BreadcrumbElement from "./BreadcrumbElement";

export type BreadcrumbElementProps = {
  route: UIMatch<unknown, RouteHandle>;
  isLastElement: boolean;
  light: boolean;
};

const BreadcrumbElementWrapper = ({
  route,
  isLastElement,
  light,
}: BreadcrumbElementProps): JSX.Element | undefined => {
  const { t } = useTranslation("Layout");

  switch (route.handle.type) {
    case RouteHandleType.exercise:
      return (
        <ExerciseBreadcrumbElement
          route={route}
          isLastElement={isLastElement}
          light={light}
        />
      );
    case RouteHandleType.layout:
      return undefined;
    default:
      return (
        <BreadcrumbElement
          isLastElement={isLastElement}
          isLoading={false}
          title={t(`Breadcrumbs:${route.handle.type}`)}
          path={route.pathname}
          light={light}
        />
      );
  }
};

export default BreadcrumbElementWrapper;
