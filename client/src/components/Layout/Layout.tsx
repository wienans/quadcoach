import Sidenav, { SidebarNavRoute } from "./Sidenav";
import brand from "../../assets/images/logo-ct.png";
import { Outlet } from "react-router-dom";

import HomeIcon from "@mui/icons-material/Home";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import ListIcon from "@mui/icons-material/List";
import { DashboardLayout } from "../LayoutContainers";
import DashboardNavbar from "../DashboardNavbar";
import SettingsMenu from "../SettingsMenu";
import { Box } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

const sidebarNavRoutes: SidebarNavRoute[] = [
  {
    type: "collapse",
    name: "Home",
    key: "home",
    route: "/",
    icon: <HomeIcon />,
    noCollapse: true,
    protected: true,
    regExp: new RegExp("\\/$"),
  },
  {
    type: "collapse",
    name: "Exercises",
    key: "exercises",
    route: "/exercises",
    icon: <ListIcon />,
    noCollapse: true,
    protected: true,
    regExp: new RegExp("\\/exercises$"),
  },
  {
    type: "collapse",
    name: "Add Exercise",
    key: "addExercise",
    route: "/exercises/add",
    icon: <PlaylistAddIcon />,
    noCollapse: true,
    protected: true,
    regExp: new RegExp("\\/exercises\\/add$"),
  },
  {
    type: "divider",
    key: "divider-1",
  },
  {
    type: "collapse",
    name: "GitHub Repository",
    key: "githubRepo",
    href: "https://github.com/wienans/quadcoach",
    icon: <GitHubIcon />,
  },
];

const Layout = () => {
  return (
    <>
      <Sidenav
        color="info"
        brand={brand}
        brandName="QuadCoach"
        routes={sidebarNavRoutes}
      />
      <DashboardLayout>
        <DashboardNavbar />
        <SettingsMenu />
        <Box sx={{ paddingLeft: 5, paddingRight: 5 }}>
          <Outlet />
        </Box>
      </DashboardLayout>
    </>
  );
};

export default Layout;
