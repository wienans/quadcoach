import "./translations";
import Sidenav, { SidebarNavRoute } from "./Sidenav";
import HomeIcon from "@mui/icons-material/Home";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import ListIcon from "@mui/icons-material/List";
import GitHubIcon from "@mui/icons-material/GitHub";
import { PresistLogin } from "..";

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
      <Sidenav color="info" routes={sidebarNavRoutes} />
      <PresistLogin />
    </>
  );
};

export default Layout;
