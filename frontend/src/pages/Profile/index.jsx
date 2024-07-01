import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import profilePicture from '../../assets/profile-picture-big.png'
import { MainButton, LinkForMainButton, LinkForSecondaryButton, InteractionFalseLink, Loader } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { formatStringDate, fetchData } from '../../utils/tools'

import Card from '../../components/Card'
import PageTitle from '../../components/PageTitle'

import Connexion from '../../pages/Connexion'



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

const ProfileHeader = styled.header`
    display: flex;
    flex-wrap:wrap;
    justify-content: space-around;
    align-items: center;
    text-align: left;
    width:100%;
    max-width:1200px;
    margin:0 auto 80px;
`

const ProfileInfos = styled.div`
    padding: 0 30px;
    box-sizing: border-box;
    width:100%;
    @media (min-width:768px){
        width:calc(100% - 300px);
    }
`

const ProfileNews = styled.section`
    width:100%;
    background-color:#d6d6d6;
    padding:60px 0 80px;
`

const PostsContainer = styled.div`
  width: 90%;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
`

const ItemWrapper = styled(Link)`
  box-sizing:border-box;
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
  border:2px solid #ffffff;
  &:hover{
    background-color: #d6d6d6;
  }
  @media (min-width:992px){
    width: calc(33% - 30px);
  }
`



function Profile () {
    const { userAsked: currentProfile } = useParams()
    const { token, setToken } = useToken()

    const [user, setUser] = useState({})
    const [userPosts, setUserPosts] = useState([])
    const [userProjects, setUserProjects] = useState([])
    const [postsLoading, setPostsLoading] = useState(false)
    const [projectsLoading, setProjectsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [needConnexion, setNeedConnexion] = useState(false)

    const [isContact, setIsContact] = useState(false)
    const [askedContact, setAskedContact] = useState(false)



    async function fetchUser() {

        const userData = {
            pseudo: currentProfile
        }

        try {
            const res = await fetchData(`/api/user/get`, userData, "identified")
           
            // http error
            if (!res.ok) {
                const message = `An error has occured: ${res.status} - ${res.statusText}`;
                setError(true)
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
            
            setUser(result.data)
            fetchPosts()
            fetchProjects()
            if(!result.data.profileOwner){
                fetchIsContact()
            }
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }


    async function fetchIsContact() {
        
        const userData = {
            pseudo: currentProfile
        }

        try {
            const res = await fetchData(`/api/contact/search_contact`, userData, "identified")
        
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
            const data = await res.json();
            
            const result = {
                status: res.status + "-" + res.statusText,
                headers: {
                    "Content-Type": res.headers.get("Content-Type"),
                    "Content-Length": res.headers.get("Content-Length"),
                },
                data: data
            }

            let response = result.data.isContact
            setIsContact(response)
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }


    async function fetchPosts() {
        setPostsLoading(true)
        const userData = {
            pseudo: currentProfile
        }

        try {
            const res = await fetchData(`/api/post/get_by_user`, userData, null)
        
            // http error
            if (!res.ok) {
                const message = `An error has occured: ${res.status} - ${res.statusText}`;
                setError(true)
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

            let postsToModify = [...result.data]
            postsToModify.forEach((post) => {
                post.creation_date = formatStringDate(post.creation_date)
                if (post.modification_date){
                    post.modification_date = formatStringDate(post.modification_date)
                }
            })

            setUserPosts(postsToModify)
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
        finally{
          setPostsLoading(false)
        }
    }


    async function fetchProjects() {

        setProjectsLoading(true)

        const userData = {
            pseudo: currentProfile
        }
        try {
            const res = await fetchData(`/api/project/get_by_user`, userData, null)
        
            // http error
            if (!res.ok) {
                const message = `An error has occured: ${res.status} - ${res.statusText}`;
                setError(true)
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
            let projectsToModify = [...result.data]
            projectsToModify.forEach((project) => {
                project.creation_date = formatStringDate(project.creation_date)
            })

            setUserProjects(projectsToModify)
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
        finally{
          setProjectsLoading(false)
        }
    }


    async function addContact() {

        const contactData = {
            pseudo: pseudo 
        }
   
        try {
            const res = await fetchData(`/api/contact/new_contact`, contactData, "identified")
        
            // http error
            if (!res.ok) {
                if (res.status === 401){
                    localStorage.setItem('token', "")
                    setToken(localStorage.getItem('token'))
                    setNeedConnexion(true)
                }
                else{
                    const message = `An error has occured: ${res.status} - ${res.statusText}`;
                    setError(true)
                    throw new Error(message);
                }
            }
            setAskedContact(true)
            fetchUser()
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }

    }


    async function deleteContact() {

        const contactData = {
            pseudo: pseudo 
        }
   
        try {
            const res = await fetchData(`/api/contact/delete`, contactData, "identified")
        
            // http error
            if (!res.ok) {
                if (res.status === 401){
                    localStorage.setItem('token', "")
                    setToken(localStorage.getItem('token'))
                    setNeedConnexion(true)
                }
                else{
                    const message = `An error has occured: ${res.status} - ${res.statusText}`;
                    setError(true)
                    throw new Error(message);
                }
            }
            setIsContact(false)
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }

    }

    useEffect(() => {
        fetchUser()
    }, [token, needConnexion])


    if (error) {
        return (
            <section style={ {textAlign:"center", marginTop:"80px"} }>
                <p style={ {fontSize:"1.6em", marginBottom:"60px"} }>L'utilisateur semble ne pas exister</p>
                <LinkForMainButton to="/">Retourner en page d'accueil</LinkForMainButton>
            </section>
        )
    }

    if (user === undefined) {
        return (
            <section style={ {textAlign:"center", marginTop:"80px"} }>
                <p style={ {fontSize:"1.6em", marginBottom:"60px"} }>Il y a eu un problème dans le chargement du profil</p>
                <LinkForMainButton to="/">Retourner en page d'accueil</LinkForMainButton>
            </section>
        )
    }

    const {
        pseudo,
        presentation,
        photo,
        profileOwner
    } = user

    let formattedText = presentation?.split("\r\n")
    formattedText = presentation?.split("\n")


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
        <ProfileWrapper>
            <PageTitle title={`Cubasics - Profil de ${pseudo}`} />
            <ProfileMain>
                <ProfileHeader>
                    <div>
                        {photo ? <div className="profile-photo" style={{backgroundImage:`url(/api/${photo})`}}></div>
                        : <div className="profile-photo" style={{backgroundImage:`url(${profilePicture})`}}></div>}
                    </div>
                    <ProfileInfos>
                        <h1 style={{ fontSize:"2em", marginBottom:"40px" }}>{pseudo}</h1>
                        <div style={{marginBottom:"50px"}}>
                            <h2>Présentation :</h2>
                            {formattedText?.map((sentence, index) => <p key={index}>{sentence}</p>)}
                        </div>
                        {!profileOwner && <div>
                            {isContact ?
                                <div>
                                    <div style={{marginBottom:"30px"}}><LinkForMainButton to="/messages">Envoyer un message</LinkForMainButton></div>
                                    <InteractionFalseLink onClick={deleteContact}>Retirer de mes contacts</InteractionFalseLink>
                                </div> :
                                <div>
                                {token ?
                                    <div>
                                        {askedContact ? <p style={{fontWeight:700, color:"#c90526"}}>Votre demande de contact a été transmise à l'utilisateur</p> :
                                        <MainButton onClick={addContact}>Ajouter à mes contacts</MainButton>}
                                    </div>:
                                    <MainButton onClick={() => setNeedConnexion(true)}>Ajouter à mes contacts</MainButton>}
                                </div>
                            }
                        </div>}
                    </ProfileInfos>
                </ProfileHeader>
                <ProfileNews>
                   <section style={ {marginBottom:"100px"} }>
                        <h2>Posts de cet utilisateur :</h2>      
                        {postsLoading ? (
                            <Loader/>
                        ) :
                        (<div>
                        { userPosts?.length > 0 ?
                            <PostsContainer>
                                {userPosts.map(({ id, title, content, category, creation_date, views, comments, favorites, user }) => 
                                    <ItemWrapper key={id} to={`/post/${id}`}>
                                        <Card
                                        title={title}
                                        category={category}
                                        content={content}
                                        date={creation_date}
                                        views={views}
                                        comments={comments}
                                        favorites={favorites}
                                        user={user}
                                        postType="post"
                                        />
                                    </ItemWrapper>
                                )}
                            </PostsContainer> :
                            <p>Cet utilisateur n'a pas de post</p>}
                        </div>)}
                    </section>
                    <section>
                        <h2>Projets de cet utilisateur :</h2>
                        {projectsLoading ? (
                            <Loader/>
                        ) :
                        (<div>
                            { userProjects?.length > 0 ? 
                            <PostsContainer>
                                {userProjects.map(({ id, title, content, category, creation_date, views, comments, favorites, user }) => 
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
                            </PostsContainer> :
                            <p>Cet utilisateur n'a pas publié de projet</p>}
                        </div>)}
                    </section>
                </ProfileNews>
            </ProfileMain>
        </ProfileWrapper>
    )
}

export default Profile