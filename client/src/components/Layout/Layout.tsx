import Sidenav from "./Sidenav"
import brand from "../../assets/images/logo-ct.png";
import { Outlet } from 'react-router-dom'

import HomeIcon from '@mui/icons-material/Home';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import ListIcon from '@mui/icons-material/List';
import { DashboardLayout } from "../LayoutContainers";
import DashboardNavbar from "../DashboardNavbar";
import SettingsMenu from "../SettingsMenu";

const sidebarNavRoutes = [
    {
        type: "collapse",
        name: "Home",
        key: "home",
        route: "/",
        icon: <HomeIcon size="12px" />,
        noCollapse: true,
        protected: true,
        regExp: new RegExp("\\/$"),
    },
    {
        type: "collapse",
        name: "Exercises",
        key: "exercises",
        route: "/exercises",
        icon: <ListIcon size="12px" />,
        noCollapse: true,
        protected: true,
        regExp: new RegExp("\\/exercises$"),
    },
    {
        type: "collapse",
        name: "Add Exercise",
        key: "addExercise",
        route: "/exercises/add",
        icon: <PlaylistAddIcon size="12px" />,
        noCollapse: true,
        protected: true,
        regExp: new RegExp("\\/exercises\\/add$"),
    },
]

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
                <Outlet />
            </DashboardLayout>
        </>
    )
}

export default Layout
