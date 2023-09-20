import { createSlice } from "@reduxjs/toolkit";

/** For now we will add all properties from ui template. In future we would delete not needed properties. */
const initialState = {
    miniSidenav: false,
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
        setMiniSideNav: (state, action) => {
            state.miniSidenav = action.payload
        },
        setTransparentSidenav: (state, action) => {
            state.transparentSidenav = action.payload
        },
        setSidenavColor: (state, action) => {
            state.sidenavColor = action.payload
        },
        setTransparentNavbar: (state, action) => {
            state.transparentNavbar = action.payload
        },
        setFixedNavbar: (state, action) => {
            state.fixedNavbar = action.payload
        },
        setOpenSettingsMenu: (state, action) => {
            state.openSettingsMenu = action.payload
        },
        setDirection: (state, action) => {
            state.direction = action.payload
        },
        setLayout: (state, action) => {
            state.layout = action.payload
        },
        /**
         * 
         * @param {*} state 
         * @param {object} action with following structure
         * {
         *  payload: {
         *     title: string,
         *     routes: { 
         *        title: string,
         *        to: string
         *      }[],
         *  }
         * }
         */
        setBreadcrumbs: (state, action) => {
            state.breadcrumbs = action.payload
        },
    },
});

export const { setMiniSideNav, setTransparentSidenav, setSidenavColor, setTransparentNavbar, setFixedNavbar, setOpenSettingsMenu, setDirection, setLayout, setBreadcrumbs } = layoutSlice.actions;

export default layoutSlice.reducer;
