/**
=========================================================
* Soft UI Dashboard React - v4.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import { ReactNode, useState } from "react";

// @mui material components
import Collapse from "@mui/material/Collapse";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import { SoftBox } from "../../";

// Custom styles for the SidenavCollapse
import {
  collapseItem,
  collapseIconBox,
  collapseIcon,
  collapseText,
} from "./styles/sidenavCollapse";
import { useAppSelector } from "../../../store/hooks";
import { PickByType } from "../../../helpers/typeHelpers";
import { Palette, PaletteColor } from "@mui/material";
import { SoftBoxProps } from "../../SoftBox";

// Soft UI Dashboard React context
// import { useSoftUIController } from "context";

export type SidenavCollapseProps<C extends React.ElementType> =
  SoftBoxProps<C> & {
    color: keyof PickByType<Palette, PaletteColor>;
    icon: string | ReactNode;
    name?: ReactNode;
    children?: ReactNode;
    active: boolean;
    /**
     * no functionality is implemented in free version
     */
    noCollapse?: boolean;
    open?: boolean;
  };

const SidenavCollapse = <C extends React.ElementType>({
  color = "info",
  icon,
  name,
  children = false,
  active = false,
  open = false,
  ...rest
}: SidenavCollapseProps<C>) => {
  const miniSidenav = useAppSelector((state) => state.layout.miniSidenav);
  const [transparentSidenav] = useState(true);
  const softBoxProps: SoftBoxProps<C> = rest as SoftBoxProps<C>;
  return (
    <>
      <ListItem component="li">
        <SoftBox
          {...softBoxProps}
          sx={(theme) => collapseItem(theme, { active, transparentSidenav })}
        >
          <ListItemIcon
            sx={(theme) =>
              collapseIconBox(theme, { active, transparentSidenav, color })
            }
          >
            {typeof icon === "string" ? (
              <Icon sx={(theme) => collapseIcon(theme, { active })}>
                {icon}
              </Icon>
            ) : (
              icon
            )}
          </ListItemIcon>

          <ListItemText
            primary={name}
            sx={(theme) =>
              collapseText(theme, { miniSidenav, transparentSidenav, active })
            }
          />
        </SoftBox>
      </ListItem>
      {children && (
        <Collapse in={open} unmountOnExit>
          {children}
        </Collapse>
      )}
    </>
  );
};

export default SidenavCollapse;
