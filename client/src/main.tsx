import "./i18n";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Route, RouterProvider } from "react-router-dom";
import theme from "./assets/theme";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { routes } from "./pages";
import { Provider } from "react-redux";
import { store } from "./store";

import { PresistLogin } from "./components";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
