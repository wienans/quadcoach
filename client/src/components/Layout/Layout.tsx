import "./translations";
import Sidenav, { SidebarNavRoute } from "./Sidenav";
import brand from "../../assets/images/logo-ct.png";
import { Outlet } from "react-router-dom";

import HomeIcon from "@mui/icons-material/Home";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import ListIcon from "@mui/icons-material/List";
import { DashboardLayout } from "../LayoutContainers";
import DashboardNavbar from "../LayoutContainers/DashboardLayout/DashboardNavbar";
import { Box } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

const sidebarNavRoutes: SidebarNavRoute[] = [
  {
    type: "collapse",
    nameResourceKey: "Layout:routes.home",
    key: "home",
    route: "/",
    icon: <HomeIcon />,
    noCollapse: true,
    protected: true,
    regExp: new RegExp("\\/$"),
  },
  {
    type: "collapse",
    nameResourceKey: "Layout:routes.exercises",
    key: "exercises",
    route: "/exercises",
    icon: <ListIcon />,
    noCollapse: true,
    protected: true,
    regExp: new RegExp("\\/exercises$"),
  },
  {
    type: "collapse",
    nameResourceKey: "Layout:routes.tacticBoards",
    key: "tacticboards",
    route: "/tacticboards",
    icon: <DeveloperBoardIcon />,
    noCollapse: true,
    protected: true,
    regExp: new RegExp("\\/tacticsboard$"),
  },
  {
    type: "divider",
    key: "divider-1",
  },
  {
    type: "collapse",
    nameResourceKey: "Layout:routes.gitHubRepository",
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
        routes={sidebarNavRoutes}
      />
      <DashboardLayout>
        <DashboardNavbar />
        <Box
          sx={(theme) => ({
            px: 1,
            [theme.breakpoints.up("sm")]: {
              px: 2,
            },
            flexGrow: 1,
          })}
        >
          <Outlet />
        </Box>
      </DashboardLayout>
    </>
  );
};

export default Layout;
