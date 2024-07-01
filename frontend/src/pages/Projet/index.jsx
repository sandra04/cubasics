import {  useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { MainButton, SecondaryButton, LinkForMainButton, LinkForSecondaryButton, InteractionFalseLink } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import {formatDate, formatStringDate, fetchData} from '../../utils/tools'

import PopularityInfos from '../../components/PopularityInfos'
import FormModifyProject from '../../components/FormModifyProject'
import PageTitle from '../../components/PageTitle'

import Connexion from '../Connexion'



const ProjectWrapper = styled.div`
    width:90%;
    margin:0 auto 150px;
    text-align:center;
    padding-top:60px;
`

const ProjectTitle = styled.h1`
  margin-bottom:30px;
  font-size:2em;
`

const ProjectInteractions = styled.div`
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  margin-bottom:40px;
`

const ProjectCategory = styled.p`
    color:#929292;
`

const ProjectContent = styled.div`
    display:grid;
    background-color:#ffffff;
    width:60%;
    margin:0 auto 40px;
    padding:40px;
    text-align:left;
`

const ProjectAuthor = styled.p`
    color:#929292;
    margin-bottom:40px;
`



function Project() {

    const { token, setToken } = useToken()
    const { id: queryId } = useParams()
    const seen = localStorage.getItem('projects-seen')
    const [projectsSeen, setProjectsSeen] = useState(seen ? JSON.parse(seen) : [])
    // const currentProject = projectsList?.find(({ id }) => id === queryId);
    const [currentProject, setCurrentProject] = useState({})
    const [error, setError] = useState(null)
    const [askingDeleteProject, setAskingDeleteProject] = useState(false)
    const [isDeletedProject, setIsDeletedProject] = useState(false)
    const [modifyingProject, setModifyingProject] = useState(false)
    const [needConnexion, setNeedConnexion] = useState(false)


    async function fetchProject() {

        const projectData = {
            id: queryId
        }

        try{
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/project/get_by_id`, projectData, "identified")

            if (!res.ok) {
                const message = `An error has occured: ${res.status} - ${res.statusText}`;
                throw new Error(message);
            }
    
            const data = await res.json();
           
            const result = {
                status: res.status + "-" + res.statusText,
                headers: {
                    "Content-Type": res.headers.get("Content-Type"),
                    "Content-Length": res.headers.get("Content-Length"),
                },
                data: data
            }
    
            let projectToModify = {...result.data}
            projectToModify.creation_date = formatStringDate(projectToModify.creation_date)
            if (projectToModify.modification_date) {
                projectToModify.modification_date = formatStringDate(projectToModify.modification_date)
            }
            setCurrentProject(projectToModify)
            if (!result.data.isAuthor){
                checkIsSeen(result.data.id, result.data.views)
            }
        }
        
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) {console.log(err) }
            setError(true)
        }
    }


    async function deleteProject() {
     
        const projectData = {
            id: id
        }
    
        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/project/delete`, projectData, "identified")
        
            // http error
            if (!res.ok) {
                if (res.status === 401){
                    localStorage.removeItem('token')
                    setToken("")
                    setNeedConnexion(true)
                }
                else{
                    const message = `An error has occured: ${res.status} - ${res.statusText}`;
                    setError(true)
                    throw new Error(message);
                }
            }
           
            setAskingDeleteProject(false)
            setIsDeletedProject(true)
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    
    }


    async function addView(id, views){

        const currentDate = new Date()
        const currentDateFormatted = formatDate(currentDate)
    
        const projectData = {
            id:id,
            views: views + 1,
            lastViewDate: currentDateFormatted
        }

        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/project/add_view`, projectData, null)
        
            // http error
            if (!res.ok) {
                const message = `An error has occured: ${res.status} - ${res.statusText}`;
                setError(true)
                throw new Error(message);
            }

            setModifyingProject(false)
           
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }


    function checkIsSeen(id, views){
        const alreadySeen = projectsSeen.find((project) => project === id)
        if (!alreadySeen){
            addView(id, views)
            setProjectsSeen([...projectsSeen, id])
        }
    }

    useEffect(() => {
        fetchProject()
    }, [queryId, modifyingProject, projectsSeen, token, needConnexion])

    useEffect(() => {
        localStorage.setItem('projects-seen', JSON.stringify(projectsSeen))
    }, [projectsSeen])


    if (error) {
        return (
            <ProjectWrapper>
                <PageTitle title="Cubasics - Projet introuvable" />
                <p style={ {textAlign:"center", fontSize:"1.6em", marginBottom:"60px"} }>Le projet démandé ne semble plus exister</p>
                <LinkForMainButton to="/projects">Retourner sur les autres projects</LinkForMainButton>
            </ProjectWrapper>
        )
    }
    
    if (currentProject === undefined) {
        return (
            <ProjectWrapper>
                <PageTitle title="Cubasics - Problème de chargement du projet" />
                <p style={ {textAlign:"center", fontSize:"1.6em", marginBottom:"60px"} }>Il y a eu un problème dans le chargement du projet</p>
                <LinkForMainButton to={`/projets`}>Retourner sur les autres projets</LinkForMainButton>
            </ProjectWrapper>
        )
    }

    const {
        id,
		title,
		style,
		content,
        image,
        audio,
		views,
		user,
        isAuthor
    } = currentProject
    const date = currentProject.creation_date
    const modifiedDate = currentProject.modification_date
    const searchedProfiles = currentProject.searched_profiles

    let formattedContent = content?.split("\r\n")
    formattedContent = content?.split("\n")

    let profilesList = searchedProfiles ? JSON.parse(searchedProfiles) : []
    profilesList = profilesList?.join(", ")
    let styleList = style ? JSON.parse(style) : []
    styleList = styleList?.join(", ")

    
    if(!token && (needConnexion === true)){
        return(
            <div>
                <PageTitle title="Cubasics - Connexion" />
                <Connexion/>
                <LinkForSecondaryButton onClick={() => setNeedConnexion(false)}>Revenir sur la page précédente</LinkForSecondaryButton>
            </div>
        )
    }

    return(
        <div>
            <PageTitle title={`Cubasics - Projet "${title}"`} />
            {isDeletedProject
            ? <div style={{textAlign:"center"}}>
                    <p style={{fontSize:"1.6em", fontWeight:700, marginTop:"150px", marginBottom:"50px"}}>Votre projet a bien été effacé</p>
                    <LinkForMainButton to="/projets">Retourner sur les autres projets</LinkForMainButton>
                </div>
            : <ProjectWrapper>
                {modifyingProject
                ? <FormModifyProject
                    id={id}    
                    title={title}
                    searchedProfiles={searchedProfiles}
                    style={style}
                    content={content}
                    image={image}
                    audio={audio}
                    modifyingProject={modifyingProject}
                    setModifyingProject={setModifyingProject}
                />
                : <div>
                    <section>
                        <header>
                            <ProjectTitle>{title}</ProjectTitle>
                        </header>
                        <ProjectInteractions>
                            <PopularityInfos popularityType="views" popularityValue={views} />
                        </ProjectInteractions>
                        <ProjectCategory>
                            <p>(Profils cherchés par l'auteur : {profilesList})</p>
                            <p>Style(s) de musique :  {styleList}</p>
                        </ProjectCategory>
                        <ProjectContent>
                            <ProjectAuthor>Posté par <Link to={`/profile/${user}`}>{user}</Link>, le {date}</ProjectAuthor>
                            {modifiedDate && <ProjectAuthor style={{marginTop:"-30px"}}>(Modifié le {modifiedDate})</ProjectAuthor>}
                            {formattedContent?.map((sentence, index) => <p key={index}>{sentence}</p>)}
                            {image && <div style={{display:"flex", flewWrap:"wrap", width:"100%", justifyContent:"space-between"}}>
                                    {JSON.parse(image).map((currentImage, index) => <img key={index} src={`http://localhost:3000/api/${currentImage}`} alt="" style={{width:"100%", maxWidth:"400px", marginBottom:"30px"}}/>)}
                                </div>}
                            {isAuthor &&
                                <div style={{ display:"flex", marginTop:"30px", alignItems:"center", flexWrap:"wrap"}}>
                                    <SecondaryButton onClick={() => setModifyingProject(true)} style={ {width:"150px", marginRight:"20px"} }>Modifier le projet</SecondaryButton>
                                    <InteractionFalseLink onClick={() => setAskingDeleteProject(true)} style={{marginTop:"15px"}}>Supprimer le projet</InteractionFalseLink>
                                </div>}
                        </ProjectContent>
                    </section>
                    {!isAuthor && <div style={ {marginBottom:"150px"} }>
                        {token
                        ? <LinkForMainButton to={`/profile/${user}`}>Contacter l'auteur</LinkForMainButton>
                        : <MainButton onClick={() => setNeedConnexion(true)}>Contacter l'auteur</MainButton>
                        }
                    </div>}
                
                    <LinkForSecondaryButton to="/projets">Voir les autres projets</LinkForSecondaryButton>

                    {askingDeleteProject && <div style={{position:"fixed", width:"100vw", height:"100vh", backgroundColor:"rgba(150,150,150,0.8)", top:0, left:0}}>
                        <div style={{margin:"60px auto 0", padding:"40px 30px", boxSizing:"border-box", width:"90%", maxWidth:"800px", backgroundColor:"#ffffff"}}>
                            <h2>Attention, vous vous apprêtez à supprimer votre projet !</h2>
                            <p>Êtes-vous sûr de vouloir le supprimer ? (vous ne pourrez plus revenir en arrière)</p>
                            <MainButton onClick={deleteProject}style={{margin:"15px"}}>Oui, je souhaite supprimer mon post</MainButton>
                            <SecondaryButton onClick={() => setAskingDeleteProject(false)} style={{margin:"15px"}}>Non, j'ai changé d'avis</SecondaryButton>
                        </div>
                    </div>}

                </div>}
            </ProjectWrapper>}
        </div>
    )
}

export default Project