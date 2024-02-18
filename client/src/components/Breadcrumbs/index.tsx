/**
=========================================================
* Soft UI Dashboard React - v4.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import "./translationts";

// @mui material components
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";

// Soft UI Dashboard React components
import { SoftBox } from "..";
import BreadcrumbElementWrapper from "./BreadcrumbElementWrapper";
import { useBreadcrumbsToRender } from "./hooks";

export type BreadcrumbRoute = {
  title: string;
  to: string;
};

export type BreadcrumbsProps = {
  light: boolean;
};

const Breadcrumbs = ({ light }: BreadcrumbsProps) => {
  const breadcrumbsToRender = useBreadcrumbsToRender();
  const breadcrumbsToRenderLength = breadcrumbsToRender.length;

  return (
    <SoftBox>
      <MuiBreadcrumbs
        sx={{
          display: "flex",
          alignItems: "center",
          "& .MuiBreadcrumbs-li": {
            display: "flex",
            alignItems: "center",
            overflowX: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
          "& .MuiBreadcrumbs-separator": {
            color: ({ palette: { white, grey } }) =>
              light ? white.main : grey[600],
          },
        }}
      >
        {breadcrumbsToRender.map((route, index) => (
          <BreadcrumbElementWrapper
            isLastElement={index === breadcrumbsToRenderLength - 1}
            route={route}
            key={route.handle.type}
            light={light}
          />
        ))}
      </MuiBreadcrumbs>
    </SoftBox>
  );
};

// Setting default values for the props of Breadcrumbs
Breadcrumbs.defaultProps = {
  light: false,
};

export default Breadcrumbs;
