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

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import { SoftBox, SoftTypography } from ".."

export type BreadcrumbRoute = {
    title: string,
    to: string
}

export type BreadcrumbsProps = {
    icon: string;
    title: string;
    routes: BreadcrumbRoute[];
    light: boolean;
}

const Breadcrumbs = ({ icon, title, routes, light }: BreadcrumbsProps) => {
    return (
        <SoftBox mr={{ xs: 0, xl: 8 }}>
            <MuiBreadcrumbs
                sx={{
                    "& .MuiBreadcrumbs-separator": {
                        color: ({ palette: { white, grey } }) => (light ? white.main : grey[600]),
                    },
                }}
            >
                <Link to="/">
                    <SoftTypography
                        component="span"
                        variant="body2"
                        color={light ? "white" : "dark"}
                        opacity={light ? 0.8 : 0.5}
                        sx={{ lineHeight: 0 }}
                    >
                        <Icon>{icon}</Icon>
                    </SoftTypography>
                </Link>
                {routes && routes.map((el) => {
                    const TitleElement =
                        <SoftTypography
                            key={el.title}
                            component="span"
                            variant="button"
                            fontWeight="regular"
                            textTransform="capitalize"
                            color={light ? "white" : "dark"}
                            opacity={light ? 0.8 : 0.5}
                            sx={{ lineHeight: 0 }}
                        >
                            {el.title}
                        </SoftTypography>

                    if (!el.to) return TitleElement
                    return (
                        <Link to={el.to} key={el.title}>
                            {TitleElement}
                        </Link>
                    )
                })}
                <SoftTypography
                    variant="button"
                    fontWeight="regular"
                    textTransform="capitalize"
                    color={light ? "white" : "dark"}
                    sx={{ lineHeight: 0 }}
                >
                    {title}
                </SoftTypography>
            </MuiBreadcrumbs>
            <SoftTypography
                fontWeight="bold"
                textTransform="capitalize"
                variant="h6"
                color={light ? "white" : "dark"}
                noWrap
            >
                {title}
            </SoftTypography>
        </SoftBox>
    );
}

// Setting default values for the props of Breadcrumbs
Breadcrumbs.defaultProps = {
    light: false,
};

export default Breadcrumbs;
