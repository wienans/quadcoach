import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "./layoutSlice";
import { BreadcrumbRoute } from "../Breadcrumbs";

/**
 *
 * @param {*} title title of the breadcrumb
 * @param {*} routes routes of the breadcrumb as array of object having title for label and to for link
 */
export const useUpdateBreadcrumbs = (
  title: string,
  routes: BreadcrumbRoute[] = [],
) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setBreadcrumbs({
        title,
        routes,
      }),
    );

    return () => {
      dispatch(setBreadcrumbs(undefined));
    };
  }, [title, routes, dispatch]);
};
