import "./translations";
import Sidenav, { SidebarNavRoute } from "./Sidenav";
import HomeIcon from "@mui/icons-material/Home";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import ListIcon from "@mui/icons-material/List";
import GitHubIcon from "@mui/icons-material/GitHub";
import DeleteIcon from "@mui/icons-material/Delete";
import { PresistLogin } from "..";
import { useAuth } from "../../store/hooks";

const Layout = () => {
  const { id: userId } = useAuth();

  const sidebarNavRoutes: SidebarNavRoute[] = [
    {
      type: "collapse" as const,
      nameResourceKey: "Layout:routes.home",
      key: "home",
      route: "/",
      icon: <HomeIcon />,
      noCollapse: true,
      protected: true,
      regExp: new RegExp("\\/$"),
    },
    {
      type: "collapse" as const,
      nameResourceKey: "Layout:routes.exercises",
      key: "exercises",
      route: "/exercises",
      icon: <ListIcon />,
      noCollapse: true,
      protected: true,
      regExp: new RegExp("\\/exercises$"),
    },
    {
      type: "collapse" as const,
      nameResourceKey: "Layout:routes.tacticBoards",
      key: "tacticboards",
      route: "/tacticboards",
      icon: <DeveloperBoardIcon />,
      noCollapse: true,
      protected: true,
      regExp: new RegExp("\\/tacticsboard$"),
    },
    {
      type: "divider" as const,
      key: "divider-1",
    },
    {
      type: "collapse" as const,
      nameResourceKey: "Layout:routes.gitHubRepository",
      key: "githubRepo",
      href: "https://github.com/wienans/quadcoach",
      icon: <GitHubIcon />,
    },
    {
      type: "divider" as const,
      key: "divider-2",
    },
    ...(userId
      ? [
          {
            type: "collapse" as const,
            nameResourceKey: "Layout:routes.deleteAccount",
            key: "deleteAccount",
            route: "/deleteAccount",
            noCollapse: true,
            icon: <DeleteIcon />,
            protected: true,
            regExp: new RegExp("\\/deleteAccount$"),
          },
        ]
      : []),
  ];
  return (
    <>
      <Sidenav color="info" routes={sidebarNavRoutes} />
      <PresistLogin />
    </>
  );
};

export default Layout;
