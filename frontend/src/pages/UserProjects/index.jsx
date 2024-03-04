import styled from 'styled-components'

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { LinkForMainButton, Loader } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { formatStringDate, fetchData } from '../../utils/tools'

import ProfileNav from '../../components/ProfileNav'
import Card from '../../components/Card'

import Connexion from '../Connexion'




const ProfileWrapper = styled.div`
    width: 100%;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    padding-bottom: 150px;
`
const ProfileMain = styled.section`
    width: 100%;
    text-align: center;
    box-sizing: border-box;
    padding-top: 60px;
`

const ProjectsContainer = styled.div`
  width: 90%;
  margin: 0 auto 60px;
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  @media (min-width:992px){
    width:80%;
  }
`

const ItemWrapper = styled(Link)`
  width: calc(100% - 30px);
  margin: 15px;
  margin-bottom: 30px;
  background-color: #ffffff;
  padding: 30px;
  cursor: pointer;
  transition: 300ms;
  text-align:left;
  text-decoration: none;
  color: #000000;
  &:hover{
    background-color: #d6d6d6;
  }
  @media (min-width:992px){
    width: calc(33% - 30px);
  }
`



function UserProjects () {
    const { token, setToken } = useToken()
 
    const [projectsList, setProjectsList] = useState([])
    const [isDataLoading, setDataLoading] = useState(false)
    const [error, setError] = useState(null)


    useEffect(() => {
        fetchProjects()
    }, [token])


    if(!token){
        return <Connexion/>
    }


    async function fetchProjects() {

        setDataLoading(true)
        
        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/project/get_by_user_private`, {}, "identified")
        
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
            const data = await res.json();
            
                const result = {
                    status: res.status + "-" + res.statusText,
                    headers: {
                        "Content-Type": res.headers.get("Content-Type"),
                        "Content-Length": res.headers.get("Content-Length"),
                    },
                    data: data
                }
                let projectsToModify = [...result.data]
                if (result.data.length > 0){
                    projectsToModify.forEach((project) => {
                        project.creation_date = formatStringDate(project.creation_date)
                    })
                }
                setProjectsList(projectsToModify)
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
        finally{
          setDataLoading(false)
        }
    }


    if (error){
        return(
            <ProfileWrapper style={{display:"block", textAlign:"center"}}>
                <p style={ {textAlign:"center", fontSize:"1.6em", margin:"100px auto 60px"} }>Il y a eu un problème</p>
                <p style={{ textAlign:"center" }}><LinkForMainButton to="/">Retourner en page d'accueil</LinkForMainButton></p>
            </ProfileWrapper>
        )
    }

    return(
        <ProfileWrapper>
            <ProfileNav />
            <ProfileMain>
                <section style={ {marginBottom:"100px"} }>
                    <h1 style={{ fontSize:"2em", marginBottom:"40px" }}>Vos projets</h1>
                    {isDataLoading ? (
                        <Loader/>
                    ) :
                    (<div>
                        { projectsList?.length > 0 ?    
                            <ProjectsContainer>
                                {projectsList.map(({ id, title, creation_date, content, views, user }) => 
                                    <ItemWrapper key={id} to={`/projet/${id}`}>
                                        <Card
                                            title={title}
                                            date={creation_date}
                                            content={content}
                                            views={views}
                                            user={user}
                                            postType="projet"
                                        />
                                    </ItemWrapper>
                                )}
                            </ProjectsContainer>
                        :
                            <div>
                                <p style={{marginBottom:"30px"}}>Vous n'avez pas encore de projet</p>
                            </div>
                        }
                    </div>)}
                    <LinkForMainButton to="/new_project">Créer un nouveau projet</LinkForMainButton>
                </section>
            </ProfileMain>
        </ProfileWrapper>
    )
}

export default UserProjects