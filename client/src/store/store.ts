import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { LayoutReducer } from "../components/Layout";
import { quadcoachApi } from "../api";

const middleware = [logger, quadcoachApi.middleware];

export const store = configureStore({
  reducer: {
    layout: LayoutReducer,
    [quadcoachApi.reducerPath]: quadcoachApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      /**
       * Quick solution for
       * react_devtools_backend.js:4026 A non-serializable value was detected in an action, in the path: `payload`.
       * Value: Fri Nov 11 2022 18:43:48 GMT+0100 (Mitteleuropäische Normalzeit)
       * Take a look at the logic that dispatched this action:  {type: 'fspInformation/setLastLoadedFspDate', p
       * payload: Fri Nov 11 2022 18:43:48 GMT+0100 (Mitteleuropäische Normalzeit)}
       * payload: Fri Nov 11 2022 18:43:48 GMT+0100 (Mitteleuropäische Normalzeit){}
       * type: "fspInformation/setLastLoadedFspDate"[[Prototype]]: Objectconstructor: ƒ Object()hasOwnProperty: ƒ hasOwnProperty()
       * isPrototypeOf: ƒ isPrototypeOf()propertyIsEnumerable: ƒ propertyIsEnumerable()toLocaleString: ƒ toLocaleString()toString: ƒ toString()
       * valueOf: ƒ valueOf()__defineGetter__: ƒ __defineGetter__()__defineSetter__: ƒ __defineSetter__()__lookupGetter__: ƒ __lookupGetter__()__
       * lookupSetter__: ƒ __lookupSetter__()__proto__: (...)get __proto__: ƒ __proto__()set __proto__: ƒ __proto__()
       * (See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants)
       * (To allow non-serializable values see: https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data)
       *
       * https://github.com/reduxjs/redux-toolkit/issues/456
       * https://redux-toolkit.js.org/api/getDefaultMiddleware
       * https://stackoverflow.com/questions/61704805/getting-an-error-a-non-serializable-value-was-detected-in-the-state-when-using     *
       */
      serializableCheck: false,
    }).concat(middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
