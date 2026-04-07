import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { MouseEvent, ReactNode, useState } from "react";

export type HeaderOverflowAction = {
  key: string;
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  color?: "error" | "inherit";
};

type HeaderOverflowMenuProps = {
  actions: HeaderOverflowAction[];
  tooltip: string;
  disabled?: boolean;
};

const HeaderOverflowMenu = ({
  actions,
  tooltip,
  disabled = false,
}: HeaderOverflowMenuProps): JSX.Element | null => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (actions.length === 0) {
    return null;
  }

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: HeaderOverflowAction) => () => {
    handleClose();
    action.onClick();
  };

  return (
    <>
      <Tooltip title={tooltip}>
        <span>
          <IconButton onClick={handleOpen} disabled={disabled}>
            <MoreVertIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {actions.map((action) => {
          const actionColor =
            action.color === "error" ? { color: "error.main" } : undefined;

          return (
            <MenuItem
              key={action.key}
              onClick={handleActionClick(action)}
              disabled={action.disabled}
              sx={actionColor}
            >
              {action.icon && (
                <ListItemIcon sx={actionColor}>{action.icon}</ListItemIcon>
              )}
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default HeaderOverflowMenu;
