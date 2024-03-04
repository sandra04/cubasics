import {  useState, useEffect } from 'react'
import styled from 'styled-components'

import { MainButton, SecondaryButton } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { checkLengthEnough, formatDate, sendCheckboxSelected, cleanText, encodeStringInput } from '../../utils/tools'

import Connexion from '../../pages/Connexion'



const ProjectTitle = styled.input`
    width:80%;
    margin:0 auto 40px;
`

const ProjectField = styled.textarea`
    width:80%;
    margin:0 auto 40px;
`
const Checkboxes = styled.div`
    display:flex;
    flex-wrap:wrap;
    justify-content:left;
    width:90%;
    max-width:1200px;
    margin:0 auto;
    box-sizing:border-box;
`

const CheckboxItem = styled.div`
    padding:20px;
`


function FormModifyProject({ id, title, searchedProfiles, style, content, image, audio, modifyingProject, setModifyingProject }){
    
    const profilesList = [
        "ingénieur du son",
        "sound designer",
        "compositeur",
        "chanteur",
        "guitariste",
        "batteur",
        "pianiste",
        "bassiste",
        "violoniste",
        "saxophoniste",
        "autre"
    ]

    const stylesList = [
        "pop",
        "rock",
        "métal",
        "variété",
        "folk",
        "jazz",
        "funk",
        "electro",
        "hip hop",
        "rnB",
        "rap",
        "classique",
        "musique de film",
        "jingle",
        "autre"
    ]

    const { token, setToken } = useToken()

    const formattedProfiles = JSON.parse(searchedProfiles)
    const formattedStyle = JSON.parse(style)

    const [titleValue, setTitleValue] = useState(title)
    const [projectValue, setProjectValue] = useState(content)
    const [titleError, setTitleError] = useState('')
    const [projectError, setProjectError] = useState('')
    const [searchedProfilesValue, setSearchedProfilesValue] = useState(formattedProfiles)
    const [projectStyle, setProjectStyle] = useState(formattedStyle)
    const [error, setError] = useState(false)


    useEffect(() => {
        setTitleError(!checkLengthEnough(titleValue, 10))
    }, [titleValue])
    useEffect(() => {
        setProjectError(!checkLengthEnough(projectValue, 30))
    }, [projectValue])


    if(!token){
        return <Connexion/>
    }


    async function modifyProject(){
       
        const currentDate = new Date()

        const currentDateFormatted = formatDate(currentDate)

        const projectData = {
            id:id,
            title: encodeStringInput(titleValue),
            content: encodeStringInput(projectValue),
            searchedProfiles: searchedProfilesValue,
            style: projectStyle,
            modificationDate: currentDateFormatted,
            image:null,
            audio:null,
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_PATH}/api/project/modify`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(projectData)
            })
        
            // http error
            if (!res.ok) {
                if (res.status === 401){
                    localStorage.removeItem('token')
                    setToken("")
                }
                else{
                    const message = `An error has occured: ${res.status} - ${res.statusText}`;
                    setError(true)
                    throw new Error(message);
                }
            }
            setModifyingProject(false)
           
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }


    function displayCheckedBeforeModif(list, checkedList){
        let elementsChecked = list.map((element) => {
            const checked = checkedList.includes(element)
            return {
                category: element,
                checked: checked ? "checked" : ""
            }
        })
        return elementsChecked
    }


    // Modifie la valeur dans le state local à chaque changement de saisie
    function handleProject(e) {
        setProjectValue(e.target.value)
    }
    function handleTitle(e) {
        setTitleValue(e.target.value)
    }

    function handleCheckboxes(checkboxName){
        if (checkboxName === "profiles"){
            const profilesInput = document.getElementsByName("profiles")
            const selectedProfiles = sendCheckboxSelected(profilesInput)
            setSearchedProfilesValue(selectedProfiles)
        }
        if (checkboxName === "styles"){
            const stylesInput = document.getElementsByName("styles")
            const selectedStyles = sendCheckboxSelected(stylesInput)
            setProjectStyle(selectedStyles)
        }
        
    }

    function checkFields(e){
        e.preventDefault();
        setTitleError(!checkLengthEnough(titleValue, 10))
        setProjectError(!checkLengthEnough(projectValue, 30))

        // Profiles checkboxes
        const profilesInput = document.getElementsByName("profiles")
        const selectedProfiles = sendCheckboxSelected(profilesInput)
        setSearchedProfilesValue(selectedProfiles)

        // Styles checkboxes
        const stylesInput = document.getElementsByName("styles")
        const selectedStyles = sendCheckboxSelected(stylesInput)
        setProjectStyle(selectedStyles)

        if(!titleError && !projectError && searchedProfilesValue.length > 0 && projectStyle.length > 0){
            modifyProject()
        }
    }
  

    const checkedProfilesBeforeModif = displayCheckedBeforeModif(profilesList, formattedProfiles)
    const checkedStylesBeforeModif = displayCheckedBeforeModif(stylesList, formattedStyle)


    return(
        <section>
            { error &&
                <div style={ {marginBottom:"60px"} }>
                    <p style={ {marginBottom:"40px", color:"red"} }>Désolé, il y a eu une erreur lors de la modification de votre projet</p>
                    <SecondaryButton onClick={() => setModifyingProject(false)}>Retourner sur mon post</SecondaryButton>
                </div>
            }
            <h2 style={ {marginBottom:"40px"} }>Modifier le projet :</h2>
            <form onSubmit={e => e.preventDefault()}>
                <div>
                    <div style={ {marginBottom:"15px"} }><label htmlFor="title">Titre du projet * :</label></div>
                    {titleError && <p style={{color:"red"}}>Merci d'écrire un titre plus long (minimum 10 caractères)</p>}
                    <ProjectTitle
                        name="title"
                        type="text"
                        id="title"
                        minLength={10}
                        maxLength={200}
                        value={titleValue}
                        onChange={handleTitle}
                        required
                    />
                </div>
             
                <div>
                    <div style={ {marginBottom:"15px", marginTop:"50px"} }><label htmlFor="post-field">Description du projet * :</label></div>
                    {projectError && <p style={{color:"red"}}>Merci d'écrire un texte plus long (minimum 30 caractères)</p>}
                    <ProjectField
                        id="post-field"
                        rows="15"
                        minLength={30}
                        value={projectValue}
                        onChange={handleProject}
                        required
                    />
                </div>
                <fieldset style={ {marginBottom:"60px", border:"none"} }>
                        {searchedProfiles.length === 0 && <p style={{color:"red"}}>Merci de sélectionner au moins 1 profil</p>}
                        <legend style={ {marginBottom:"15px"} }>Profil(s) recherché(s) * :</legend>
                        <Checkboxes>
                            {checkedProfilesBeforeModif.map((profile, index) =>
                                <CheckboxItem key={index}>
                                    <input type="checkbox" id={cleanText(profile.category)} name="profiles" value={profile.category} onClick={() => handleCheckboxes("profiles")} defaultChecked={profile.checked}/>
                                    <label htmlFor={cleanText(profile.category)}>{profile.category}</label>
                                </CheckboxItem>
                            )}
                        </Checkboxes>
                    </fieldset>
                    <fieldset style={ {marginBottom:"60px", border:"none"} }>
                        {projectStyle.length === 0 && <p style={{color:"red"}}>Merci de sélectionner au moins 1 style</p>}
                        <legend style={ {marginBottom:"15px"} }>Le(s) style(s) de musique * :</legend>
                        <Checkboxes>
                            {checkedStylesBeforeModif.map((style, index) =>
                                <CheckboxItem key={index}>
                                    <input type="checkbox" id={cleanText(style.category)} name="styles" value={style.category} onClick={() => handleCheckboxes("styles")} defaultChecked={style.checked}/>
                                    <label htmlFor={cleanText(style.category)}>{style.category}</label>
                                </CheckboxItem>
                            )}
                        </Checkboxes>
                    </fieldset>
                <div>
                    <MainButton onClick={checkFields} style={ {margin:"15px"} }>Sauvegarder</MainButton>
                    <SecondaryButton onClick={() => setModifyingProject(false)} style={{margin:"15px"}}>Annuler la modification</SecondaryButton>
                </div>
            </form>
        </section>
    )
}

export default FormModifyProject