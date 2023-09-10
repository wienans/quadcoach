import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

const AddExercise = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [video_url, setVideoUrl] = useState("");
    const [time_min, setTimeMin] = useState(0);
    const [persons, setPersons] = useState(0);
    const [materials_string, setMaterials] = useState("");
    const [tags_string, setTags] = useState("");
    const [error, setError] = useState(false)

    const navigate = useNavigate()

    const add = async () => {
        if (!name || !description) {
            setError(true)
            return false
        }
        let materials = materials_string.replace(/\s/g, '').split(',')
        let tags = tags_string.replace(/\s/g, '').split(',')

        console.warn(JSON.stringify({ name, description, video_url, time_min, persons, materials, tags }))
        let result = await fetch("/api/add-exercise", {
            method: 'post',
            body: JSON.stringify({ name, description, video_url, time_min, persons, materials, tags }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        navigate("/")
    }

    return (
        <div className="add-product">
            <h1> Add Exercise</h1>
            <input className="inputBox" type="text" placeholder="Enter Name"
                value={name} onChange={(e) => setName(e.target.value)} />
            {error && !name && <span className="invalid-input">Enter name</span>}
            <input className="inputBox" type="text" placeholder="Enter Description"
                value={description} onChange={(e) => setDescription(e.target.value)} />
            {error && !description && <span className="invalid-input">Enter description</span>}
            <input className="inputBox" type="text" placeholder="Enter Video URL"
                value={video_url} onChange={(e) => setVideoUrl(e.target.value)} />
            <label>Suggested Time in minutes</label>
            <input className="inputBox" type="number" min="0" step="1"
                value={time_min} onChange={(e) => setTimeMin(e.target.value)} />
            <label>Person Number</label>
            <input className="inputBox" type="number" min="0" step="1"
                value={persons} onChange={(e) => setPersons(e.target.value)} />
            <input className="inputBox" type="text" placeholder="Material"
                value={materials_string} onChange={(e) => setMaterials(e.target.value)} />
            <input className="inputBox" type="text" placeholder="Tags"
                value={tags_string} onChange={(e) => setTags(e.target.value)} />
            <button onClick={add} className="appButton" type="button">Add Exercise</button>
        </div>
    )
}

export default AddExercise