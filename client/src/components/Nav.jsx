import React from 'react'
import {Link} from 'react-router-dom'

const Nav = () => {
    return(
        <div>
            <ul className='nav-ul'>
                <li><Link to="/">Exercise</Link></li>
                <li><Link to="/add">Add Exercise</Link></li>
                <li><Link to="/edit">Edit Exercise</Link></li>
            </ul>
        </div>
    )
}

export default Nav