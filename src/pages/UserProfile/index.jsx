import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import profilePicture from '../../assets/profile-picture-big.png'
import modifyIcon from '../../assets/modify-icon-grey.png'
import { MainButton, LinkForMainButton, SecondaryButton, InteractionFalseLink, Loader } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { formatStringDate } from '../../utils/tools'

import ProfileNav from '../../components/ProfileNav'
import Card from '../../components/Card'
import FormModifyPsd from '../../components/FormModifyPsd'
import FormModifyPresentation from '../../components/FormModifyPresentation'
import FormModifyPhoto from '../../components/FormModifyPhoto'

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

const ProfilePictureContainer = styled.div`
    position: relative;
    height:200px;
    width:200px;
    &:hover{
        cursor:pointer;
    }
`
const ProfilePictureModify = styled.img`
    width: 20px;
    position: absolute;
    top: 150px;
    left: 200px;
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
  justify-content: space-between;
`

const ItemWrapper = styled(Link)`
  width: calc(100% - 60px);
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
    width: calc(33% - 90px);
  }
`



function UserProfile () {
    const { token, setToken } = useToken()
    const [user, setUser] = useState({})
    const [userPosts, setUserPosts] = useState([])
    // const [commentedPosts, setCommentedPosts] = useState([])
    // const [favoritePosts, setFavoritePosts] = useState([])
    const [postsLoading, setPostsLoading] = useState(false)
    // const [commentedLoading, setCommentedLoading] = useState(false)
    // const [favoriteLoading, setFavoriteLoading] = useState(false)
    const [error, setError] = useState(null)
    const [modifyingPsd, setModifyingPsd] = useState(false)
    const [modifyingPresentation, setModifyingPresentation] = useState(false)
    const [modifyingPhoto, setModifyingPhoto] = useState("")
    const [askingDeleteUser, setAskingDeleteUser] = useState(false)
    const [isDeletedUser, setIsDeletedUser] = useState(false)
    //✎

    useEffect(() => {
        fetchUser()
    }, [token, modifyingPresentation, modifyingPhoto])

    useEffect(() => {
        fetchPosts()
        // fetchCommentedPosts()
        // fetchFavoritePosts()
    }, [])

    
    if(!token){
        return <Connexion/>
    }


    async function fetchUser() {
        
        try {
            const res = await fetch(`${process.env.REACT_APP_API_PATH}/api/user/get_private`, {
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body:JSON.stringify()
            });
        
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
                setUser(result.data)
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }


    async function fetchPosts() {
        
        setPostsLoading(true)
        
        try {
            const res = await fetch(`${process.env.REACT_APP_API_PATH}/api/post/get_by_user_private`, {
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body:JSON.stringify({})
            });
        
            // http error
            if (!res.ok) {
                if (res.status !== 404) {
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


    /*async function fetchCommentedPosts() {
        setCommentedLoading(true)
        
        try {
            const res = await fetch(`${process.env.REACT_APP_API_PATH}/api/post/get_commented_posts_by_user`, {
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body:JSON.stringify({})
            });
        
            // http error
            if (!res.ok) {
                if (res.status !== 404) {
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
            }
            else{
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

                setCommentedPosts(postsToModify)
            }
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
        finally{
          setCommentedLoading(false)
        }
    }*/


    /*async function fetchFavoritePosts() {
        setFavoriteLoading(true)
        
        try {
            const res = await fetch(`${process.env.REACT_APP_API_PATH}/api/post/get_favorite_posts_by_user`, {
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body:JSON.stringify({})
            });
        
            // http error
            if (!res.ok) {
                if (res.status !== 404) {
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
            }
            else{
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

                setFavoritePosts(postsToModify)
            }
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
        finally{
          setFavoriteLoading(false)
        }
    }*/


    async function deleteUser() {
    
        try {
            const res = await fetch(`${process.env.REACT_APP_API_PATH}/api/user/delete`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body:JSON.stringify({})
            });
        
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
        
            setAskingDeleteUser(false)
            setIsDeletedUser(true)
            localStorage.setItem('token', "")
            setToken(localStorage.getItem('token'))
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    
    }


    const {
        pseudo,
        presentation,
        photo
    } = user

    let formattedText = presentation?.split("\r\n")
    formattedText = presentation?.split("\n")


    if (error){
        return(
            <ProfileWrapper style={{display:"block", textAlign:"center"}}>
                <p style={ {textAlign:"center", fontSize:"1.6em", margin:"100px auto 60px"} }>Il y a eu un problème</p>
                <p style={{ textAlign:"center" }}><LinkForMainButton to="/">Retourner en page d'accueil</LinkForMainButton></p>
            </ProfileWrapper>
        )
    }


    return(
        <div>
            {isDeletedUser ?
                <div>
                    <p style={{fontSize:"1.6em", fontWeight:700, textAlign:"center", marginTop:"150px"}}>Votre compte a bien été effacé</p>
                    <LinkForMainButton to="/">Retourner en page d'accueil</LinkForMainButton>
                </div> :
                <ProfileWrapper>
                    <ProfileNav />
                    {modifyingPsd ?
                        <FormModifyPsd
                            modifyingPsd={modifyingPsd}
                            setModifyingPsd={setModifyingPsd}
                        /> :
                        <ProfileMain>
                            {modifyingPresentation ?
                                <FormModifyPresentation
                                presentation={presentation}    
                                modifyingPresentation={modifyingPresentation}
                                    setModifyingPresentation={setModifyingPresentation}
                                /> :
                                <div>
                                    {modifyingPhoto ?
                                    <FormModifyPhoto
                                        photo={photo}    
                                        modifyingPhoto={modifyingPhoto}
                                        setModifyingPhoto={setModifyingPhoto}
                                    /> :
                                    <ProfileHeader>
                                        <ProfilePictureContainer>
                                            {photo ? <div className="profile-photo" style={{backgroundImage:`url(http://localhost:3000/api/${photo})`}} onClick={() => setModifyingPhoto(true)}></div>
                                            /*<ProfilePicture src={`http://localhost:3000/api/${photo}`} alt={`${pseudo} profile`} onClick={() => setModifyingPhoto(true)}/>*/:
                                            <div className="profile-photo" style={{backgroundImage:`url(${profilePicture})`}} onClick={() => setModifyingPhoto(true)}></div>
                                            /*<ProfilePicture src={profilePicture} alt={`${pseudo} profile`} onClick={() => setModifyingPhoto(true)}/>*/}
                                            <ProfilePictureModify src={modifyIcon} alt="" onClick={() => setModifyingPhoto(true)}/>
                                        </ProfilePictureContainer>
                                        <ProfileInfos>
                                            <h1 style={{ fontSize:"2em", marginBottom:"40px" }}>Bonjour {pseudo}</h1>
                                            <div>
                                                <h2>Présentation :</h2>
                                                {presentation ?
                                                    <div>
                                                        {formattedText?.map((sentence, index) => <p key={index}>{sentence}</p>)}
                                                        <div>
                                                            <SecondaryButton onClick={() => setModifyingPresentation(true)} style={{display:"block", marginBottom:"80px", marginTop:"30px"}}>Modifier ma présentation</SecondaryButton>
                                                        </div>
                                                    </div> :
                                                    <div>
                                                        <p>Vous n'avez pas encore de présentation</p>
                                                        <div>
                                                            <SecondaryButton onClick={() => setModifyingPresentation(true)} style={{display:"block", marginBottom:"80px"}}>Ajouter une présentation</SecondaryButton>
                                                            
                                                        </div>
                                                    </div>}
                                            </div>
                                        </ProfileInfos>
                                        <SecondaryButton onClick={() => setModifyingPsd(true)}>Modifier mon mot de passe</SecondaryButton>
                                    </ProfileHeader>}
                                </div>}
                            <ProfileNews>
                                <section style={ {marginBottom:"100px"} }>
                                    <h2>Vos posts</h2>
                                    {postsLoading ? (
                                        <Loader/>
                                    ) :
                                    (<div>
                                        {userPosts?.length > 0 ?    
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
                                            </PostsContainer>
                                        :
                                            <div>
                                                <p style={{marginBottom:"30px"}}>Vous n'avez pas encore de post</p>
                                                <LinkForMainButton to="/new_post">Créer un nouveau post</LinkForMainButton>
                                            </div>
                                        }
                                    </div>)}
                                </section>
                            </ProfileNews>
                            <div style={{marginTop:"60px", fontWeight:700}}>
                            <InteractionFalseLink onClick={() => setAskingDeleteUser(true)}>Supprimer mon compte</InteractionFalseLink>
                            </div>
                            {askingDeleteUser && <div style={{position:"fixed", width:"100vw", height:"100vh", backgroundColor:"rgba(150,150,150,0.8)", top:0, left:0}}>
                                <div style={{margin:"60px auto 0", padding:"40px 30px", boxSizing:"border-box", width:"90%", maxWidth:"800px", backgroundColor:"#ffffff"}}>
                                    <h2>Attention, vous vous apprêtez à supprimer définitivement votre compte !</h2>
                                    <p>Êtes-vous sûr de vouloir le supprimer ? (vous ne pourrez plus revenir en arrière)</p>
                                    <MainButton onClick={deleteUser} style={{margin:"15px"}}>Oui, je souhaite supprimer mon compte</MainButton>
                                    <SecondaryButton onClick={() => setAskingDeleteUser(false)} style={{margin:"15px"}}>Non, j'ai changé d'avis</SecondaryButton>
                                </div>
                            </div>}
                    </ProfileMain>}
                </ProfileWrapper>}
        </div>
    )
}

export default UserProfile





/*
{ commentedPosts?.length > 0 &&
    <section style={ {marginBottom:"100px"} }>
        <h2>Nouveautés sur les posts que vous avez commentés</h2>   
            <PostsContainer>
                {commentedPosts.map(({ id, title, content, category, creation_date, views, comments, favorites, user }) => 
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
            </PostsContainer>
    </section>}
{ favoritePosts?.length > 0 &&
    <section>
        <h2>Nouveautés sur vos favoris</h2>
        <PostsContainer>
            {favoritePosts.map(({ id, title, content, category, creation_date, views, comments, favorites, user }) => 
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
        </PostsContainer>
    </section>}
*/