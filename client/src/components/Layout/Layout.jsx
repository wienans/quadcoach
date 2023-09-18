import Sidenav from "./Sidenav"
import brand from "../../assets/images/logo-ct.png";
import { Outlet } from 'react-router-dom'

import HomeIcon from '@mui/icons-material/Home';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { DashboardLayout } from "../LayoutContainers";
import DashboardNavbar from "../DashboardNavbar";

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
        name: "Übung hinzufügen",
        key: "addExercise",
        route: "/exercise/add",
        icon: <PlaylistAddIcon size="12px" />,
        noCollapse: true,
        protected: true,
        regExp: new RegExp("\\/exercise\\/add$"),
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
                <Outlet />
            </DashboardLayout>
        </>
    )
}

export default Layout
