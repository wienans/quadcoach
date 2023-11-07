import { ReactNode, useState } from "react";
import Collapse from "@mui/material/Collapse";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IconButton, IconButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { SoftBox, SoftTypography } from "..";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}
export type CollapsibleProps = {
  label: string;
  children: ReactNode;
};
const ExpandMore = styled((props: ExpandMoreProps) => {
  const { ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const Collapsible = (props: CollapsibleProps) => {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    setOpen(!open);
  };

  return (
    <div>
      <SoftBox
        variant="contained"
        borderRadius="lg"
        shadow="lg"
        opacity={1}
        p={1}
        my={2}
      >
        <CardActions disableSpacing>
          <SoftTypography>{props.label}</SoftTypography>
          <ExpandMore
            expand={open}
            onClick={toggle}
            aria-expanded={open}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <CardContent>{props.children}</CardContent>
        </Collapse>
      </SoftBox>
    </div>
  );
};
export default Collapsible;
