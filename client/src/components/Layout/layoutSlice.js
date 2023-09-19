import { createSlice } from "@reduxjs/toolkit";

/** For now we will add all properties from ui template. In future we would delete not needed properties. */
const initialState = {
    miniSidenav: false,
    transparentSidenav: true,
    sidenavColor: "info",
    transparentNavbar: true,
    fixedNavbar: true,
    openConfigurator: false,
    direction: "ltr",
    layout: "dashboard",
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
        setOpenConfigurator: (state, action) => {
            state.openConfigurator = action.payload
        },
        setDirection: (state, action) => {
            state.direction = action.payload
        },
        setLayout: (state, action) => {
            state.layout = action.payload
        },
    },
});

export const { setMiniSideNav, setTransparentSidenav, setSidenavColor, setTransparentNavbar, setFixedNavbar, setOpenConfigurator, setDirection, setLayout } = layoutSlice.actions;

export default layoutSlice.reducer;
