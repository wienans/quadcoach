import "./translations";
import Sidenav, { SidebarNavRoute } from "./Sidenav";
import HomeIcon from "@mui/icons-material/Home";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import ListIcon from "@mui/icons-material/List";
import GitHubIcon from "@mui/icons-material/GitHub";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import { PresistLogin } from "..";
import { useAuth } from "../../store/hooks";
import { useDeleteUserMutation } from "../../pages/userApi";
import { useNavigate } from "react-router-dom";
import { useSendLogoutMutation } from "../../pages/authApi";

const Layout = () => {
  const { id: userId } = useAuth();
  const [deleteUser] = useDeleteUserMutation();
  const [sendLogout] = useSendLogoutMutation();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      if (
        userId &&
        window.confirm(
          "Are you sure you want to delete your account? This action cannot be undone.",
        )
      ) {
        await deleteUser(userId).unwrap();
        await sendLogout({}).unwrap();
        navigate("/");
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

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
            nameResourceKey: "Layout:routes.userProfile",
            key: "userProfile",
            route: "/users/" + userId,
            icon: <AccountCircleIcon />,
            noCollapse: true,
            protected: true,
            regExp: new RegExp("\\/users"),
          },
          {
            type: "collapse" as const,
            nameResourceKey: "Layout:routes.deleteAccount",
            key: "deleteAccount",
            noCollapse: true,
            icon: <DeleteIcon />,
            protected: true,
            onClick: handleDeleteAccount,
          },
        ]
      : [
          {
            type: "collapse" as const,
            nameResourceKey: "Layout:routes.login",
            key: "login",
            noCollapse: true,
            route: "/login",
            icon: <LoginIcon />,
            protected: true,
          },
        ]),
  ];
  return (
    <>
      <Sidenav color="info" routes={sidebarNavRoutes} />
      <PresistLogin />
    </>
  );
};

export default Layout;
