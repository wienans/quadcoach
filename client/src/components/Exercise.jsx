import React from "react";
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
import Collapsible from "./Collapsible";
import { Link } from "react-router-dom";

const Exercise = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [video_url, setVideoUrl] = useState("");
    const [time_min, setTimeMin] = useState(0);
    const [persons, setPersons] = useState(0);
    const [materials_string, setMaterials] = useState("");
    const [tags_string, setTags] = useState("");
    // const [error, setError] = useState(false)

    const params = useParams()

    const navigate = useNavigate()

    useEffect(() => {
        getExerciseDetails()
    }, [])

    const getExerciseDetails = async () => {
        let result = await fetch(`http://localhost:3001/exercise/${params.id}`)
        result = await result.json()
        console.warn(result)
        setName(result.name)
        setDescription(result.description)
        setVideoUrl(result.video_url)
        setTimeMin(result.time_min)
        setPersons(result.persons)
        setMaterials(result.materials.toString())
        setTags(result.tags.toString())
    }

    const update = async () => {

        navigate(`/update/${params.id}`)

    }

    const deleteExercise = async () => {
        let result = await fetch(`http://localhost:3001/exercise/${params.id}`, {
            method: "delete",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        result = await result.json()
        if (result) {
            navigate("/")
        }
    }


    return (
        <div className="add-product">
            <h1> Exercise: {name}</h1>
            <Collapsible label="Description">
                {description}
            </Collapsible>
            <hr />
            <Link to={video_url}>Video URL</Link>
            <hr />
            Suggested Time in minutes: {time_min}
            <hr />
            <label>Person Number:  {persons}</label>
            <hr />
            <Collapsible label="Material">
                {materials_string}
            </Collapsible>
            <hr />
            <Collapsible label="Tags">
                {tags_string}
            </Collapsible>
            <button onClick={update} className="appButton" type="button">Update Exercise</button>
            <button onClick={deleteExercise} className="appButton" type="button">Delete Exercise</button>
        </div>
    )
}

export default Exercise