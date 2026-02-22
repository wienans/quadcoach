import { useTranslation } from "react-i18next";
import { UIMatch } from "react-router-dom";
import { useGetTacticBoardQuery } from "../../api/quadcoachApi/tacticboardApi";
import { RouteHandle } from "../../pages/routes/routeTypes";
import BreadcrumbElement from "./BreadcrumbElement";

export type TacticBoardBreadcrumbElementProps = {
  route: UIMatch<unknown, RouteHandle>;
  isLastElement: boolean;
  light: boolean;
};

const TacticBoardBreadcrumbElement = ({
  route,
  isLastElement,
  light,
}: TacticBoardBreadcrumbElementProps): JSX.Element => {
  const { t } = useTranslation("Breadcrumbs");
  const { id: tacticBoardId } = route.params;

  const { data: tacticBoard, isLoading: isTacticBoardLoading } =
    useGetTacticBoardQuery(tacticBoardId || "", {
      skip: tacticBoardId == null,
    });

  return (
    <BreadcrumbElement
      isLastElement={isLastElement}
      isLoading={isTacticBoardLoading}
      title={tacticBoard?.name ?? t("Breadcrumbs:tacticBoard")}
      path={route.pathname}
      light={light}
    />
  );
};

export default TacticBoardBreadcrumbElement;
