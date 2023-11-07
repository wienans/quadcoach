import { ReactNode } from "react";

export type IconDirection = "left" | "right" | "none"

export type Icon = {
    direction: IconDirection;
    component: ReactNode
}
