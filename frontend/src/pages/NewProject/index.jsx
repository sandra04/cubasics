import {  useState, useEffect } from 'react'
import styled from 'styled-components'

import { MainButton, LinkForMainButton, LinkForSecondaryButton, Loader } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { formatDate, checkLengthEnough, sendCheckboxSelected, cleanText, fetchData } from '../../utils/tools'

import Connexion from '../Connexion'



const ProjectWrapper = styled.div`
    width:90%;
    margin:0 auto 150px;
    text-align:center;
    padding-top:60px;
`
const ProjectTitle = styled.input`
    width:80%;
    margin:0 auto 40px;
`

const ProjectField = styled.textarea`
    width:80%;
    margin:0 auto 60px;
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


function NewProject() {
    const { token, setToken } = useToken()

    const [titleValue, setTitleValue] = useState('')
    const [projectValue, setProjectValue] = useState('')
    const [titleError, setTitleError] = useState(false)
    const [projectError, setProjectError] = useState(false)
    const [titleIsFirstWritting, setTitleFirstWritting] = useState(true)
    const [projectIsFirstWritting, setProjectFirstWritting] = useState(true)
    const [searchedProfiles, setSearchedProfiles] = useState([])
    const [projectStyle, setProjectStyle] = useState([])

    const [isDataSending, setDataSending] = useState(false)
    const [error, setError] = useState(false)
    const [isFormOk, setIsFormOk] = useState(false)


    const profiles = [
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

    const styles = [
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


    useEffect(() => {
        setTitleError(!checkLengthEnough(titleValue, 10))
    }, [titleValue])
    useEffect(() => {
        setProjectError(!checkLengthEnough(projectValue, 30))
    }, [projectValue])



    if(!token){
        return <Connexion/>
    }


    async function sendProject(){

        setDataSending(true)
       
        const currentDate = new Date()

        const currentDateFormatted = formatDate(currentDate)

        const projectData = {
            title: titleValue,
            content: projectValue,
            searchedProfiles: searchedProfiles,
            style: projectStyle,
            creationDate: currentDateFormatted,
            image:null,
            audio:null,
        }
          
        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/project/create_new_project`, projectData, "identified")
        
            // http error
            if (!res.ok) {
                if (res.status === 401){
                    localStorage.setItem('token', "")
                    setToken(localStorage.getItem('token'))
                }
                else{
                    const message = `An error has occured: ${res.status} - ${res.statusText}`;
                    setError(true)
                    throw new Error(message);
                }
            }
            setError(false)
            setIsFormOk(true)        
            
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }

        finally{
            setDataSending(false)
        }
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
            setSearchedProfiles(selectedProfiles)
        }
        if (checkboxName === "styles"){
            const stylesInput = document.getElementsByName("styles")
            const selectedStyles = sendCheckboxSelected(stylesInput)
            setProjectStyle(selectedStyles)
        }
        
    }
 

    function checkFields(e){
        e.preventDefault();

        setTitleFirstWritting(false)
        setProjectFirstWritting(false)

        setTitleError(!checkLengthEnough(titleValue, 10))
        setProjectError(!checkLengthEnough(projectValue, 30))

        // Profiles checkboxes
        const profilesInput = document.getElementsByName("profiles")
        const selectedProfiles = sendCheckboxSelected(profilesInput)
        setSearchedProfiles(selectedProfiles)

        // Styles checkboxes
        const stylesInput = document.getElementsByName("styles")
        const selectedStyles = sendCheckboxSelected(stylesInput)
        setProjectStyle(selectedStyles)
        

        if(!titleError && !projectError && searchedProfiles.length > 0 && projectStyle.length > 0){
            sendProject()
        }
        else{
            setIsFormOk(false)
        }
    }


    // Lorsqu'on sort de l'input (lancé sur "onBlur")
    function projectCheckIsFirst(){
        if (projectIsFirstWritting){
            setProjectFirstWritting(false)
        }
    }
    function titleCheckIsFirst(){
        if (titleIsFirstWritting){
            setTitleFirstWritting(false)
        }
    }
    
    
    return(
        <ProjectWrapper>
            {isDataSending ? (
                <Loader/>
            ) :
            (<div>
                { error &&
                    <div style={ {marginBottom:"60px"} }>
                        <p style={ {marginBottom:"40px", color:"red"} }>Désolé, il y a eu une erreur lors de l'envoi de votre projet</p>
                        <LinkForSecondaryButton to="/projets">Voir les autres projets</LinkForSecondaryButton>
                    </div>
                }
                <h1 style={ {marginBottom:"40px"} }>Nouveau projet :</h1>
                {!isFormOk ? (
                    <form>
                        <div>
                        <div style={ {marginBottom:"15px"} }><label htmlFor="title">Titre du projet * :</label></div>
                            {!titleIsFirstWritting && titleError && <p style={{color:"red"}}>Merci d'écrire un titre plus long (minimum 10 caractères)</p>}
                            <ProjectTitle
                                name="title"
                                type="text"
                                id="title"
                                minLength={10}
                                maxLength={200}
                                value={titleValue}
                                onChange={handleTitle}
                                onBlur={titleCheckIsFirst}
                                required
                            />
                        </div>
                        <div>
                            <div style={ {marginBottom:"15px"} }><label htmlFor="project-field">Description du projet * :</label></div>
                            {!projectIsFirstWritting && projectError && <p style={{color:"red"}}>Merci d'écrire un texte plus long (minimum 30 caractères)</p>}
                            <ProjectField
                                id="project-field"
                                rows="15"
                                minLength={30}
                                value={projectValue}
                                onChange={handleProject}
                                onBlur={projectCheckIsFirst}
                                required
                            />
                        </div>
                        <fieldset style={ {marginBottom:"60px", border:"none"} }>
                            {searchedProfiles.length === 0 && <p style={{color:"red"}}>Merci de sélectionner au moins 1 profil</p>}
                            <legend style={ {marginBottom:"15px"} }>Profil(s) recherché(s) * :</legend>
                            <Checkboxes>
                                {profiles.map((profile, index) =>
                                    <CheckboxItem key={index}>
                                        <input type="checkbox" id={cleanText(profile)} name="profiles" value={profile} onClick={() => handleCheckboxes("profiles")} />
                                        <label htmlFor={cleanText(profile)}>{profile}</label>
                                    </CheckboxItem>
                                )}
                            </Checkboxes>
                        </fieldset>
                        <fieldset style={ {marginBottom:"60px", border:"none"} }>
                            {projectStyle.length === 0 && <p style={{color:"red"}}>Merci de sélectionner au moins 1 style</p>}
                            <legend style={ {marginBottom:"15px"} }>Le(s) style(s) de musique * :</legend>
                            <Checkboxes>
                                {styles.map((style, index) =>
                                    <CheckboxItem key={index}>
                                        <input type="checkbox" id={cleanText(style)} name="styles" value={style} onClick={() => handleCheckboxes("styles")} />
                                        <label htmlFor={cleanText(style)}>{style}</label>
                                    </CheckboxItem>
                                )}
                            </Checkboxes>
                        </fieldset>
                        <div><MainButton onClick={checkFields}>Publier mon projet</MainButton></div>
                    </form>)
                : (
                    <div>
                        <p style={ {marginBottom:"40px"} }>Merci ! Votre projet a bien été envoyé</p>
                        <LinkForMainButton to="/projets">Voir les autres projets</LinkForMainButton>
                    </div>
                )}
            </div>)}
        </ProjectWrapper>
    )
}

export default NewProject