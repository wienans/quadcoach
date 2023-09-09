import React from "react";
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";

const UpdateExercise = () => {
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

        let materials = materials_string.replace(/\s/g, '').split(',')
        let tags = tags_string.replace(/\s/g, '').split(',')

        console.warn(JSON.stringify({ name, description, video_url, time_min, persons, materials, tags }))
        let result = await fetch(`http://localhost:3001/exercise/${params.id}`, {
            method: "put",
            body: JSON.stringify({ name, description, video_url, time_min, persons, materials, tags }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        result = await result.json()
        console.warn(result)
        if (result) {
            navigate("/")
        }

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
            <h1> Update Exercise</h1>
            <input className="inputBox" type="text" placeholder="Enter Name"
                value={name} onChange={(e) => setName(e.target.value)} />
            {/* {error && !name && <span className="invalid-input">Enter name</span>} */}
            <input className="inputBox" type="text" placeholder="Enter Description"
                value={description} onChange={(e) => setDescription(e.target.value)} />
            {/* {error && !description && <span className="invalid-input">Enter description</span>} */}
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
            <button onClick={update} className="appButton" type="button">Update Exercise</button>
            <button onClick={deleteExercise} className="appButton" type="button">Delete Exercise</button>
        </div>
    )
}

export default UpdateExercise