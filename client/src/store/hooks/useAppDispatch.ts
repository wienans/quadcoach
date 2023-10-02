/**
 * Use throughout your app instead of plain `useDispatch` and `useSelector`
 * https://redux-toolkit.js.org/tutorials/typescript#define-typed-hooks
 */
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";

export const useAppDispatch: () => AppDispatch = useDispatch;
