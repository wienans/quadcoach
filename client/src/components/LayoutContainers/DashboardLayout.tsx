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
import { useAppSelector } from "../../store/hooks";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// Soft UI Dashboard React components
import SoftBox from "../SoftBox";

// Soft UI Dashboard React context
// import { useSoftUIController, setLayout } from "context";

function DashboardLayout({ children }) {
    const miniSidenav = useAppSelector(state => state.layout.miniSidenav)

    return (
        <SoftBox
            sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
                p: 3,
                position: "relative",

                [breakpoints.up("xl")]: {
                    marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
                    transition: transitions.create(["margin-left", "margin-right"], {
                        easing: transitions.easing.easeInOut,
                        duration: transitions.duration.standard,
                    }),
                },
            })}
        >
            {children}
        </SoftBox>
    );
}

// Typechecking props for the DashboardLayout
DashboardLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default DashboardLayout;
