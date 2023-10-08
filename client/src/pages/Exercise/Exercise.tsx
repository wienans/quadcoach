import React from "react";
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import Link from '@mui/material/Link';
import { Card, Grid, } from "@mui/material";
import { SoftBox, SoftButton, SoftTypography } from "../../components";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import { Chip } from "@mui/material"
import CopyrightIcon from '@mui/icons-material/Copyright';
import ReactPlayer from 'react-player'

const values = [
    {
        label: "Person Number:",
        getElement: exercise => (
            <SoftTypography variant="button" fontWeight="regular" color="text">{exercise.persons}</SoftTypography>
        )
    },
    {
        label: "Beater Number:",
        getElement: exercise => (
            <SoftTypography variant="button" fontWeight="regular" color="text">{exercise.beaters}</SoftTypography>
        )
    },
    {
        label: "Chaser Number:",
        getElement: exercise => (
            <SoftTypography variant="button" fontWeight="regular" color="text">{exercise.chasers}</SoftTypography>
        )
    },
]

const Exercise = () => {
    const [exercise, setExercise] = useState({
        id: null,
        name: "",
        persons: 0,
        beaters: 0,
        chasers: 0,
        materials: [],
        tags: [],
        descriptionBlocks: [],
        relatedTo:[],
        creator: ""
    })
    const [related_exercises,setRelatedExercises] = useState([])

    useUpdateBreadcrumbs(name ? `Exercise ${name}` : "View exercise", [{ title: "Exercises", to: "exercises" }])

    const params = useParams()

    const navigate = useNavigate()

    useEffect(() => {
        getExerciseDetails()
    }, [])

    const getExerciseDetails = async () => {
        let result = await fetch(`/api/exercise/${params.id}`)
        result = await result.json()

        setExercise({
            id: result._id,
            name: result.name,
            persons: result.persons,
            beaters: result.beaters,
            chasers: result.chasers,
            materials: result.materials,
            tags: result.tags,
            descriptionBlocks: result.description_blocks,
            relatedTo: result.related_to,
            creator: result.creator,
        })
        let rel_exercises = []
        for(let i = 0; i<result.related_to.length; i++){
            let related_result = await fetch(`/api/exercise/${result.related_to[i]}`)
            rel_exercises.push(await related_result.json()) 
        }
        setRelatedExercises(rel_exercises)

    }

    const update = async () => {
        navigate(`/exercises/${params.id}/update`)
    }

    const deleteExercise = async () => {
        let result = await fetch(`/api/exercise/${params.id}`, {
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

    const handleChipClick = (id) => {
        navigate(`/exercises/${id}`)
        // Workaround because above line does only update the link but page isn't reloaded
        navigate(0)
    };

    return (
        <> 
        <Card 
            sx={{ 
                backdropFilter: `saturate(200%) blur(30px)`, 
                backgroundColor: ({ functions: { rgba }, palette: { white } }) => rgba(white.main, 0.8), 
                boxShadow: ({ boxShadows: { navbarBoxShadow } }) => navbarBoxShadow, 
                position: "relative", 
                py: 2, 
                px: 2, 
            }} 
        > 
            <Grid container spacing={3} alignItems="center"> 
                <Grid item> 
                    <SoftBox height="100%" mt={0.5} lineHeight={1}> 
                        <SoftTypography variant="h4" fontWeight="bold"> 
                            {exercise.name} 
                        </SoftTypography> 
                    </SoftBox> 
                </Grid> 
                <Grid item sx={{ ml: "auto" }}> 
                    <SoftButton 
                        onClick={update} 
                        color="primary" 
                        sx={{ marginRight: 1 }} 
                    > 
                        Update Exercise 
                    </SoftButton> 
                    <SoftButton 
                        onClick={deleteExercise} 
                        color="error" 
                    > 
                        Delete Exercise 
                    </SoftButton> 
                </Grid> 
            </Grid> 
        </Card> 
        <SoftBox mt={5} mb={3}> 
            <Card sx={{ height: "100%" }}> 
                <SoftBox p={2}> 
                    <SoftTypography variant="h5" fontWeight="bold" textTransform="uppercase"> 
                        Info
                    </SoftTypography> 
                    <SoftBox> 
                        <Grid container spacing={2}> 
                            {values.map(({ label, getElement }) => ( 
                                <Grid item xs={4} key={label}> 
                                    <SoftBox key={label} display="flex" py={1} pr={2}> 
                                        <SoftTypography variant="button" fontWeight="bold" textTransform="capitalize" mr={2}> 
                                            {label} 
                                        </SoftTypography> 
                                        {getElement(exercise)} 
                                    </SoftBox> 
                                </Grid> 
                            ))} 
                        </Grid> 
                    </SoftBox> 
                    <SoftBox > 
                        <SoftTypography variant="button" fontWeight="bold" textTransform="capitalize" mr={2}> 
                            Materials: 
                        </SoftTypography> 
                        {exercise.materials.map((el,index) => 
                            {
                                if(el != ""){
                                    return <Chip size="small" key={el+index} label={el} sx={{margin: "2px"}} variant={"outlined"} />;
                                }
                            }
                        )}
                    </SoftBox>
                    <SoftBox> 
                        <SoftTypography variant="button" fontWeight="bold" textTransform="capitalize" mr={2}> 
                            Tags:
                        </SoftTypography> 
                        {exercise.tags.map((el,index) => 
                            {
                                if(el != ""){
                                    return <Chip size="small" key={el+index} label={el} sx={{margin: "2px"}} variant={"outlined"} />;
                                }
                            }
                                
                        )}
                    </SoftBox>  
                    <SoftBox> 
                        <SoftTypography variant="button" fontWeight="bold" textTransform="capitalize" mr={2}> 
                            Related To:
                        </SoftTypography> 
                        {exercise.relatedTo.map((el,index) => 
                            {
                                if(related_exercises.length > 0){
                                    return <Chip size="small" key={el+index} label={related_exercises[index].name} sx={{margin: "2px"}} variant={"outlined"} onClick={()=>{handleChipClick(el)}}/>;
                                }
                            }
                        )}
                    </SoftBox> 
                    <SoftBox textAlign={"right"}> 
                        <SoftTypography variant="button" fontWeight="regular" textTransform="capitalize" mr={2} align = {"right"}> 
                           <CopyrightIcon/> {exercise.creator}
                        </SoftTypography> 
                    </SoftBox> 
                </SoftBox> 
            </Card> 
        </SoftBox> 
        {exercise.descriptionBlocks.map((el, index) => 
            {return (
                <SoftBox mt={3} mb={3} key={index}> 
                    <Card sx={{ height: "100%", padding: 2 }}> 
                        <SoftBox mb={2}>
                            <SoftTypography variant="h5" fontWeight="bold" textTransform="uppercase" > 
                                Block {index+1}
                            </SoftTypography> 
                            <SoftTypography variant="button"  textTransform="capitalize" mr={2} > 
                                Time: {el.time_min} minutes
                            </SoftTypography> 
                        </SoftBox>
                        <SoftBox  sx={{paddingTop: "56.26%", position: "relative"}}>
                            <ReactPlayer style={{position: "absolute", top:"0px", left:"0px"}} url={el.video_url} width="100%" height="100%" controls={true} light={true}/>
                        </SoftBox> 
                        <SoftBox mt={3}>
                            <SoftTypography variant="h5" fontWeight="bold" textTransform="uppercase" > 
                                Description
                            </SoftTypography> 
                            <SoftTypography variant="body2" textTransform="capitalize" mr={2} > 
                                {el.description}
                            </SoftTypography> 
                        </SoftBox> 
                        <SoftBox mt={3}> 
                            <SoftTypography variant="h5" fontWeight="bold" textTransform="uppercase"> 
                                Coaching Points
                            </SoftTypography> 
                            <SoftTypography variant="body2"  textTransform="capitalize" mr={2} > 
                                {el.coaching_points}
                            </SoftTypography> 
                        </SoftBox> 
                    </Card> 
                </SoftBox> 
            )}
        )}
    </> 
    )
}

export default Exercise
