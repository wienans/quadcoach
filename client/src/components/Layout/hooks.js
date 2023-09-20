import { useEffect } from "react";
import { useDispatch } from "react-redux"
import { setBreadcrumbs } from "./layoutSlice";

/**
 * 
 * @param {*} title title of the breadcrumb
 * @param {*} routes routes of the breadcrumb as array of object having title for label and to for link
 */
export const useUpdateBreadcrumbs = (title, routes = []) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setBreadcrumbs({
            title,
            routes,
        }))

        return () => {
            dispatch(setBreadcrumbs(undefined))
        }
    }, [title, routes])
}
