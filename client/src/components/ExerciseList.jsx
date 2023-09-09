import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const ExerciseList = () => {
    const [exercises, setExercises] = useState([])

    useEffect(() => {
        getExercises()
    }, [])

    const getExercises = async () => {
        let result = await fetch("http://localhost:3001/exercises")
        result = await result.json()
        setExercises(result)
    }

    const searchHandle = async (event) => {
        let key = event.target.value
        if (key) {
            let result = await fetch(`http://localhost:3001/search/${key}`)
            result = await result.json()
            if (result) {
                setExercises(result)
            }
        } else {
            getExercises()
        }
    }

    return (
        <div className="exercise-list">
            <h3>Exercise List</h3>
            <input type="" className="search-exercise-box" placeholder="Search Exercise"
                onChange={searchHandle} />
            <ul>
                <li>Name</li>
                <li>Persons</li>
                <li>Tags</li>
            </ul>
            {
                exercises.map((item) =>
                    <ul key={item._id}>
                        <li><Link to={"/update/" + item._id}>{item.name}</Link></li>
                        <li>{item.persons}</li>
                        {item.tags != "" && <li>{item.tags.toString()}</li>}
                        {item.tags == "" && <li>No Tags</li>}
                    </ul>)

            }

        </div>
    )
}

export default ExerciseList