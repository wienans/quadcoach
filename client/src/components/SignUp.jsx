import React from "react";
import { useState } from "react";

const SignUp=()=>{
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const signUpData=()=>{
        console.warn(name,email,password)
    }
    return(
        <div className="register">
            <h1>Register</h1>
            <input className="inputBox" type="text" placeholder="Enter Name" 
                value={name} onChange={(e)=>setName(e.target.value)}/>
            <input className="inputBox" type="text" placeholder="Enter Email"
                value={email} onChange={(e)=>setEmail(e.target.value)}/>
            <input className="inputBox" type="password" placeholder="Enter password"
                value={password} onChange={(e)=>setPassword(e.target.value)}/>
            <button onClick={signUpData} className="appButton" type="button">Sign Up</button>
        </div>
    )
}

export default SignUp