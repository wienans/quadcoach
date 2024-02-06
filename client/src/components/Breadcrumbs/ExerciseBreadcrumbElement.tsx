import { useTranslation } from "react-i18next";
import { useGetExerciseQuery } from "../../pages/exerciseApi";
import BreadcrumbElement from "./BreadcrumbElement";
import { UIMatch } from "react-router-dom";
import { RouteHandle } from "../../pages/routes/routeTypes";

export type ExerciseBreadcrumbElementProps = {
  route: UIMatch<unknown, RouteHandle>;
  isLastElement: boolean;
  light: boolean;
};

const ExerciseBreadcrumbElement = ({
  route,
  isLastElement,
  light,
}: ExerciseBreadcrumbElementProps): JSX.Element => {
  const { t } = useTranslation("Breadcrumbs");
  const { id: exerciseId } = route.params;

  const { data: exercise, isLoading: isExerciseLoading } = useGetExerciseQuery(
    exerciseId || "",
    {
      skip: exerciseId == null,
    },
  );

  return (
    <BreadcrumbElement
      isLastElement={isLastElement}
      isLoading={isExerciseLoading}
      title={exercise?.name ?? t("Breadcrumbs:exercise")}
      path={route.pathname}
      light={light}
    />
  );
};

export default ExerciseBreadcrumbElement;
