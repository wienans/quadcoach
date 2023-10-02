/**
 * Use throughout your app instead of plain `useDispatch` and `useSelector`
 * https://redux-toolkit.js.org/tutorials/typescript#define-typed-hooks
 */

import { TypedUseSelectorHook, useSelector } from "react-redux";
import { RootState } from "../store";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
