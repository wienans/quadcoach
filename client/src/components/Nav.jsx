import React from 'react'
import { Link } from 'react-router-dom'

const Nav = () => {
    const auth = localStorage.getItem('user')
    return (
        <div>
            <ul className='nav-ul'>
                <li><Link to="/">Exercise</Link></li>
                <li><Link to="/add">Add Exercise</Link></li>
                {/* <li><Link to="/edit">Edit Exercise</Link></li> */}
                {/* <li>{auth ? <Link to="/logout">Log Out</Link> :<Link to="/signup">Sign Up</Link>}</li> */}
            </ul>
        </div>
    )
}

export default Nav