import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate()

    useEffect(() => {
        const auth = localStorage.getItem('user')
        if (auth) {
            // navigate('/')
        }
    }, [])

    const signUpData = async () => {
        let result = await fetch("/api/register", {
            method: 'post',
            body: JSON.stringify({ name, email, password }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        result = await result.json()
        localStorage.setItem("user", JSON.stringify(result))
        navigate("/")


    }
    return (
        <div className="register">
            <h1>Register</h1>
            <input className="inputBox" type="text" placeholder="Enter Name"
                value={name} onChange={(e) => setName(e.target.value)} />
            <input className="inputBox" type="text" placeholder="Enter Email"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="inputBox" type="password" placeholder="Enter password"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={signUpData} className="appButton" type="button">Sign Up</button>
        </div>
    )
}

export default SignUp