import React from 'react';
import { useState, useEffect, useRef } from "react";
const Collapsible = (props) => {
    const [open, setOpen] = useState(false);
    const toggle = () => {
        setOpen(!open);
    };
    const contentRef = useRef();
    return (
        <div><button onClick={toggle} className={!open ? 'collapsible' : 'active'}>{props.label}</button>
            <div className="content-parent"
                ref={contentRef} style={open ? {
                    height: contentRef.current.scrollHeight +
                        "px"
                } : { height: "0px" }}>
                <div className="content">{props.children}</div>
            </div>
        </div>
    );
}
export default Collapsible;