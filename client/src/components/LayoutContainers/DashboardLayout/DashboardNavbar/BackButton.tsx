import { IconButton, Theme, Tooltip, useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { UIMatch, useMatches } from "react-router-dom";
import {
  RouteHandle,
  RouteHandleType,
} from "../../../../pages/routes/routeTypes";
import { SystemStyleObject } from "@mui/system/styleFunctionSx/styleFunctionSx";
import { SoftBox } from "../../..";

type BackButtonInfo = {
  href: string;
  tooltip: string;
};

const getBackButtonHrefProps = (
  routeMatches: UIMatch<unknown, RouteHandle>[],
): BackButtonInfo | undefined => {
  const routeMatchesLength = routeMatches.length;
  if (!routeMatchesLength) return;

  const lastRouteMatch = routeMatches[routeMatchesLength - 1];

  if (!lastRouteMatch) return;

  switch (lastRouteMatch.handle.type) {
    case RouteHandleType.updateExercise: {
      const exerciseRoute = routeMatches.find(
        (route) => route.handle.type === RouteHandleType.exercise,
      );
      if (!exerciseRoute) return;
      return {
        href: exerciseRoute.pathname,
        tooltip: "Zurück zur Übung",
      };
    }
    case RouteHandleType.addExercise:
    case RouteHandleType.exercise: {
      const exercisesRoute = routeMatches.find(
        (route) => route.handle.type === RouteHandleType.exercises,
      );
      if (!exercisesRoute) return;
      return {
        href: exercisesRoute.pathname,
        tooltip: "Zurück zu den Übungen",
      };
    }
  }
};

export type BackButtonProps = {
  sx?: SystemStyleObject<Theme>;
};

const BackButton = ({ sx }: BackButtonProps): JSX.Element | undefined => {
  const isUpXs = useMediaQuery((theme: Theme) => theme.breakpoints.up("xs"));
  const routeMatches = (
    useMatches() as UIMatch<unknown, RouteHandle>[]
  )?.filter((route) => route.handle?.type != null);

  const backButtonInfo = getBackButtonHrefProps(routeMatches);

  if (!isUpXs || !backButtonInfo) return undefined;

  return (
    <SoftBox sx={sx}>
      <Tooltip title={backButtonInfo.tooltip}>
        <IconButton href={backButtonInfo.href}>
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
    </SoftBox>
  );
};

export default BackButton;
