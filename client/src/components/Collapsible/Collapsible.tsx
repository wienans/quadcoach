import { useState, useRef } from "react";
import Collapse from '@mui/material/Collapse';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {IconButton,IconButtonProps} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Typography } from "@mui/material";


interface ExpandMoreProps extends IconButtonProps {
    expand?: boolean;
}
export type CollapsibleProps  = {
    label?: string,
    children?: string
}
const ExpandMore = styled((props: ExpandMoreProps) => {
    const {expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

const Collapsible = (props: CollapsibleProps) => {
    const [open, setOpen] = useState(false);
    const toggle = () => {
        setOpen(!open);
    };
    useRef();
    return (
        <div>
            <Card>
                <CardActions disableSpacing>
                    <Typography>{props.label}</Typography>
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
                    <CardContent>
                        <Typography>
                            {props.children}
                        </Typography>
                    </CardContent>
                </Collapse>
            </Card>
        </div>
    );
}
export default Collapsible;