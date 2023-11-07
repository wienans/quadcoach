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

import { forwardRef } from "react";

// Custom styles for SoftInput
import SoftInputRoot from "./SoftInputRoot";
import SoftInputWithIconRoot from "./SoftInputWithIconRoot";
import SoftInputIconBoxRoot from "./SoftInputIconBoxRoot";
import SoftInputIconRoot from "./SoftInputIconRoot";
import { InputBaseProps } from "@mui/material";
import { Icon } from "./types";
import { useAppSelector } from "../../store/hooks";

// Soft UI Dashboard React contexts
// import { useSoftUIController } from "context";

export interface SoftInputProps extends InputBaseProps {
  icon?: Icon;
  success?: boolean;
}

const SoftInput = forwardRef<HTMLDivElement, SoftInputProps>(
  (
    {
      size = "medium",
      icon = {
        component: false,
        direction: "none",
      },
      error = false,
      success = false,
      disabled = false,
      ...rest
    },
    ref,
  ) => {
    let template;

    const direction = useAppSelector((state) => state.layout.direction);
    const iconDirection = icon.direction;

    if (icon.component && icon.direction === "left") {
      template = (
        <SoftInputWithIconRoot
          ref={ref}
          ownerState={{ error, success, disabled }}
        >
          <SoftInputIconBoxRoot ownerState={{ size }}>
            <SoftInputIconRoot fontSize="small" ownerState={{ size }}>
              {icon.component}
            </SoftInputIconRoot>
          </SoftInputIconBoxRoot>
          <SoftInputRoot
            {...rest}
            ownerState={{
              size,
              error,
              success,
              iconDirection,
              direction,
              disabled,
            }}
          />
        </SoftInputWithIconRoot>
      );
    } else if (icon.component && icon.direction === "right") {
      template = (
        <SoftInputWithIconRoot
          ref={ref}
          ownerState={{ error, success, disabled }}
        >
          <SoftInputRoot
            {...rest}
            ownerState={{
              size,
              error,
              success,
              iconDirection,
              direction,
              disabled,
            }}
          />
          <SoftInputIconBoxRoot ownerState={{ size }}>
            <SoftInputIconRoot fontSize="small" ownerState={{ size }}>
              {icon.component}
            </SoftInputIconRoot>
          </SoftInputIconBoxRoot>
        </SoftInputWithIconRoot>
      );
    } else {
      template = (
        <SoftInputRoot
          {...rest}
          ref={ref}
          ownerState={{ size, error, success, disabled }}
        />
      );
    }

    return template;
  },
);

export default SoftInput;
