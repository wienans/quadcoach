import React from 'react';
import { useState, useEffect, useRef } from "react";
import Collapse from '@mui/material/Collapse';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import { Typography } from "@mui/material";

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

const Collapsible = (props) => {
    const [open, setOpen] = useState(false);
    const toggle = () => {
        setOpen(!open);
    };
    const contentRef = useRef();
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