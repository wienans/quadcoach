import { useEffect, useState } from "react";
import { UIMatch, useMatches } from "react-router-dom";
import { RouteHandle, RouteHandleType } from "../../pages/routes/routeTypes";

const routeHandleTypesNotRender: RouteHandleType[] = [RouteHandleType.layout];

export const useBreadcrumbsToRender = () => {
  const routeMatches = useMatches() as UIMatch<unknown, RouteHandle>[];
  const [breadcrumbsToRender, setBreadcrumbsToRender] = useState<
    UIMatch<unknown, RouteHandle>[]
  >([]);

  useEffect(() => {
    const newRoutesToRender = routeMatches.filter(
      (route) =>
        route.handle?.type != null &&
        !routeHandleTypesNotRender.includes(route.handle.type),
    );

    setBreadcrumbsToRender(newRoutesToRender);
  }, [routeMatches]);

  return breadcrumbsToRender;
};
