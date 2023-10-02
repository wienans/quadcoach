import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { BreadcrumbRoute } from "../Breadcrumbs";

export type StoredBreadCrumbs = {
    title: string;
    routes: BreadcrumbRoute[];
}

type SidenavColors = "primary" | "dark" | "info" | "success" | "warning" | "error"

// Define a type for the slice state
interface LayoutState {
    miniSidenav: boolean;
    transparentSidenav: boolean;
    sidenavColor: SidenavColors;
    transparentNavbar: boolean;
    fixedNavbar: boolean;
    openSettingsMenu: boolean;
    direction: string; // TODO check possible values. ltr and rtl?
    layout: string;
    breadcrumbs?: StoredBreadCrumbs
}

/** For now we will add all properties from ui template. In future we would delete not needed properties. */
const initialState: LayoutState = {
    miniSidenav: true,
    transparentSidenav: true,
    // We set sidenavColor fixed to info inside components/Layout/Layout.tsx and components/Layout/Sidenav 
    // => sidenavColor property needs to be deleted
    // available colors: "primary", "dark", "info", "success", "warning", "error"
    sidenavColor: "info",
    transparentNavbar: true,
    fixedNavbar: true,
    openSettingsMenu: false,
    direction: "ltr",
    layout: "dashboard",
    breadcrumbs: undefined,
}

export const layoutSlice = createSlice({
    name: "counter",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        setMiniSideNav: (state, action: PayloadAction<boolean>) => {
            state.miniSidenav = action.payload
        },
        setTransparentSidenav: (state, action: PayloadAction<boolean>) => {
            state.transparentSidenav = action.payload
        },
        setSidenavColor: (state, action: PayloadAction<SidenavColors>) => {
            state.sidenavColor = action.payload
        },
        setTransparentNavbar: (state, action: PayloadAction<boolean>) => {
            state.transparentNavbar = action.payload
        },
        setFixedNavbar: (state, action: PayloadAction<boolean>) => {
            state.fixedNavbar = action.payload
        },
        setOpenSettingsMenu: (state, action: PayloadAction<boolean>) => {
            state.openSettingsMenu = action.payload
        },
        setDirection: (state, action: PayloadAction<string>) => {
            state.direction = action.payload
        },
        setLayout: (state, action: PayloadAction<string>) => {
            state.layout = action.payload
        },
        setBreadcrumbs: (state, action: PayloadAction<StoredBreadCrumbs | undefined>) => {
            state.breadcrumbs = action.payload
        },
    },
});

export const { setMiniSideNav, setTransparentSidenav, setSidenavColor, setTransparentNavbar, setFixedNavbar, setOpenSettingsMenu, setDirection, setLayout, setBreadcrumbs } = layoutSlice.actions;

export default layoutSlice.reducer;
