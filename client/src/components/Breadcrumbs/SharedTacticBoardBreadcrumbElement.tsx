import { useTranslation } from "react-i18next";
import { UIMatch } from "react-router-dom";
import { useGetSharedTacticBoardQuery } from "../../api/quadcoachApi/tacticboardApi";
import { RouteHandle } from "../../pages/routes/routeTypes";
import BreadcrumbElement from "./BreadcrumbElement";

export type SharedTacticBoardBreadcrumbElementProps = {
  route: UIMatch<unknown, RouteHandle>;
  isLastElement: boolean;
  light: boolean;
};

const SharedTacticBoardBreadcrumbElement = ({
  route,
  isLastElement,
  light,
}: SharedTacticBoardBreadcrumbElementProps): JSX.Element => {
  const { t } = useTranslation("Breadcrumbs");
  const { token } = route.params;

  const { data: tacticBoard, isLoading: isTacticBoardLoading } =
    useGetSharedTacticBoardQuery(token || "", {
      skip: token == null,
    });

  const sharedPrefix = t("sharedTacticBoard");
  const boardName = tacticBoard?.name;
  const title = boardName ? `${sharedPrefix} / ${boardName}` : sharedPrefix;

  return (
    <BreadcrumbElement
      isLastElement={isLastElement}
      isLoading={isTacticBoardLoading}
      title={title}
      path={route.pathname}
      light={light}
    />
  );
};

export default SharedTacticBoardBreadcrumbElement;
