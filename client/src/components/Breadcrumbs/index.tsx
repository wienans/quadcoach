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

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import { Breadcrumbs as MuiBreadcrumbs, styled } from "@mui/material";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import { SoftBox, SoftTypography } from "..";
import BreadcrumbElementWrapper from "./BreadcrumbElementWrapper";
import { useBreadcrumbsToRender } from "./hooks";

const StyledBreadcrumbs = styled(MuiBreadcrumbs)`
  .MuiBreadcrumbs-li {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    // flex: 1;
  }
`;

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
    <SoftBox
      sx={
        {
          // width: "100%",
        }
      }
    >
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
