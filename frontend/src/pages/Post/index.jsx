import {  useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { MainButton, SecondaryButton, LinkForMainButton, LinkForSecondaryButton, InteractionLink, InteractionFalseLink, Loader } from '../../utils/styles/Atoms'
import favoriteUnselected from '../../assets/favorite-unselected.png'
import favorite from '../../assets/favorite.png'

import { useToken } from '../../utils/hooks'
import {checkLengthEnough, formatDate, formatStringDate, fetchData} from '../../utils/tools'

import PopularityInfos from '../../components/PopularityInfos'
import FormModifyPost from '../../components/FormModifyPost'
import FormModifyComment from '../../components/FormModifyComment'

import Connexion from '../Connexion'



const PostWrapper = styled.div`
    width:90%;
    margin:0 auto 150px;
    text-align:center;
    padding-top:60px;
`

const PostTitle = styled.h1`
  margin-bottom:30px;
  font-size:2em;
`

const PostInteractions = styled.div`
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  margin-bottom:40px;
`

const PostCategory = styled.p`
    color:#929292;
`

const PostContent = styled.div`
    display:grid;
    background-color:#ffffff;
    width:60%;
    margin:0 auto 40px;
    padding:40px;
    text-align:left;
`

const PostAuthor = styled.p`
    color:#929292;
    margin-bottom:40px;
`

const CommentsContainer = styled.section`
    margin-bottom:120px;
`

const AnswerWrapper = styled.section`
    background-color:#d6d6d6;
    padding:60px 30px;
    margin-bottom:100px;
`

const AnswerField = styled.textarea`
    width:90%;
    margin:0 auto 40px;
`



function Post() {
    const { token, setToken } = useToken()
    const { id: queryId } = useParams()
    const seen = localStorage.getItem('posts-seen')

    const [postsSeen, setPostsSeen] = useState(seen ? JSON.parse(seen) : [])
    const [currentPost, setCurrentPost] = useState({})
    const [error, setError] = useState(null)
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [commentsList, setCommentsList] = useState([])
    const [isFavorite, setIsFavorite] = useState(false)
    const [askingDeletePost, setAskingDeletePost] = useState(false)
    const [isDeletedPost, setIsDeletedPost] = useState(false)
    const [askingDeleteComment, setAskingDeleteComment] = useState(false)
    const [commentToDelete, setCommentToDelete] = useState(null)
    const [modifyingPost, setModifyingPost] = useState(false)
    const [modifyingComment, setModifyingComment] = useState(false)
    const [commentToModify, setCommentToModify] = useState({})
    const [needConnexion, setNeedConnexion] = useState(false)



    // DISPLAY POST
    async function fetchPost() {

        const postData = {
            id: queryId
        }

        try{
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/post/get_by_id`, postData, "identified")

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
            
            let postToModify = {...result.data}
            postToModify.creation_date = formatStringDate(postToModify.creation_date)
            if (postToModify.modification_date) {
                postToModify.modification_date = formatStringDate(postToModify.modification_date)
            }

            JSON.parse(postToModify.image)
            setCurrentPost(postToModify)
            fetchComments(result.data.id)

            if(token && !result.data.isAuthor){
                fetchFavorite(result.data.id)
            }
            if (!result.data.isAuthor){
                checkIsSeen(result.data.id, result.data.views)
            }  
        }

        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
          setError(true)
        }
    }


    async function deletePost() {
     
        const postData = {
            id: id
        }
    
        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/post/delete`, postData, "identified")
        
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
           
            setAskingDeletePost(false)
            setIsDeletedPost(true)
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
    
        const postData = {
            id:id,
            views: views + 1,
            lastViewDate: currentDateFormatted
        }

        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/post/add_view`, postData, null)
            
            // http error
            if (!res.ok) {
                const message = `An error has occured: ${res.status} - ${res.statusText}`;
                setError(true)
                throw new Error(message);
            }

            setModifyingPost(false)
           
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }



    // DISPLAY COMMENT
    async function fetchComments(id) {
        
        setCommentsLoading(true)

        const commentData = {
          postId: id
        }
    
        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/comment/get_by_post`, commentData, "identified")
        
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

            let commentsToModify = [...result.data]
           commentsToModify.forEach((comment) => {
                comment.creation_date = formatStringDate(comment.creation_date)
                if (comment.modification_date) {
                    comment.modification_date = formatStringDate(comment.modification_date)
                }
            })
            
            setCommentsList(commentsToModify)
  
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }

        finally{
            setCommentsLoading(false)
        }
 
    }

    
    // DISPLAY FAVORITE
    async function fetchFavorite(id) {

        const favoriteData = {
            postId: id
        }

        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/favorite/get`, favoriteData, "identified")
        
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

            setIsFavorite(result.data.isFavorite)
            
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }
  
    function checkIsSeen(id, views){
        const alreadySeen = postsSeen.find((post) => post === id)
        if (alreadySeen){}
        else{
            addView(id, views)
            setPostsSeen([...postsSeen, id])
        }
    }


    useEffect(() => {
        fetchPost()
    }, [queryId, modifyingPost, modifyingComment, postsSeen, token, needConnexion])

    useEffect(() => {
        localStorage.setItem('posts-seen', JSON.stringify(postsSeen))
    }, [postsSeen])



    // HANDLE FAVORITE

    async function addFavorite() {

        const currentDate = new Date()
        const currentDateFormatted = formatDate(currentDate)

        const favoriteData = {
            date: currentDateFormatted,
            postId: id
        }
    
        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/favorite/add`, favoriteData, "identified")
        
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
            setIsFavorite(true)
            fetchPost()
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }

    }


    async function deleteFavorite() {

        const favoriteData = {
            postId: id
        }
    
        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/favorite/delete`, favoriteData, "identified")
        
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
            setIsFavorite(false)   
            fetchPost()
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }

    }


    function favoriteVerification () {
    
        if (isFavorite) {
            deleteFavorite()
        }
        else{
            addFavorite()
        }
    }



    // HANDLE COMMENTS

    function handleModifyComment(commentId, commentContent){
        setCommentToModify({id: commentId, content: commentContent})
        setModifyingComment(true)
    }
    function handleDeleteComment(commentId){
        setAskingDeleteComment(true)
        setCommentToDelete(commentId)
    }

    async function deleteComment() {
        if (typeof commentToDelete === 'number'){
            const commentData = {
                id: commentToDelete
            }
        
            try {
                const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/comment/delete`, commentData, "identified")
            
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

                setAskingDeleteComment(false)
                setCommentToDelete(null)
                fetchPost()
            }
            // Network error
            catch(err){
                if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
                setError(true)
            }

        }
    }


    // COMMENT FORM
    const [inputValue, setInputValue] = useState('')
    const [inputError, setInputError] = useState(false)
    const [isFirstWritting, setFirstWritting] = useState(true)
    const [replyToComment, setReplyToComment] = useState(null)


    async function sendComment(){
       
        const currentDate = new Date()

        const currentDateFormatted = formatDate(currentDate)


        const commentData = {
            content: inputValue,
            creationDate: currentDateFormatted,
            image: null,
            audio: null,
            postId: id,
            commentId: replyToComment ? replyToComment : null
        }
          
        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/comment/create_new_comment`, commentData, "identified")
        
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

            setReplyToComment(null)
            setInputValue("")
            setFirstWritting(true)
            fetchPost()
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }

    function checkComment(e){
        e.preventDefault()
        setInputError(!checkLengthEnough(inputValue, 3))
        if (!inputError){
            sendComment()
        }
    }
    
    // Modifie la valeur dans le state local à chaque changement de saisie
    function handleInput(e) {
        setInputValue(e.target.value)
	}

    // Lorsqu'on sort de l'input (lancé sur "onBlur")
    function checkIsFirst(){
        if (isFirstWritting){
            setFirstWritting(false)
        }
    }

    useEffect(() => {
        setInputError(!checkLengthEnough(inputValue, 3))
    }, [inputValue])

    
    if (error) {
        return (
            <PostWrapper>
                <p style={ {textAlign:"center", fontSize:"1.6em", marginBottom:"60px"} }>Le post démandé ne semble plus exister</p>
                <LinkForMainButton to="/posts">Retourner sur les autres posts</LinkForMainButton>
            </PostWrapper>
        )
    }

    if (currentPost === undefined) {
        return (
            <PostWrapper>
                <p style={ {textAlign:"center", fontSize:"1.6em", marginBottom:"60px"} }>Il y a eu un problème dans le chargement du post</p>
                <LinkForMainButton to="/posts">Retourner sur les autres posts</LinkForMainButton>
            </PostWrapper>
        )
    }


    const {
        id,
		title,
		category,
		content,
        image,
        audio,
		views,
        comments,
		favorites,
        user,
        isAuthor
    } = currentPost
    const date = currentPost.creation_date
    const modifiedDate = currentPost.modification_date

  
    let formattedContent = content?.split("\r\n")
    formattedContent = content?.split("\n")
    

    if(!token && (needConnexion === true)){
        return(
            <div>
                <Connexion/>
                <LinkForSecondaryButton onClick={() => setNeedConnexion(false)}>Revenir sur la page précédente</LinkForSecondaryButton>
            </div>
        )
    }

    return(
        <div>
            {isDeletedPost ?
                <div style={{textAlign:"center"}}>
                    <p style={{fontSize:"1.6em", fontWeight:700, marginTop:"150px", marginBottom:"50px"}}>Votre post a bien été effacé</p>
                    <LinkForMainButton to="/posts">Retourner sur les autres posts</LinkForMainButton>
                </div> :
            <PostWrapper>
                {modifyingPost ?
                    <FormModifyPost
                        id={id}    
                        title={title}
                        category={category}
                        content={content}
                        image={image}
                        audio={audio}
                        setModifyingPost={setModifyingPost}
                    /> :
                    <div>
                        <section>
                            <header>
                                <PostTitle>{title}</PostTitle>
                            </header>
                            <PostInteractions>
                                <PopularityInfos popularityType="views" popularityValue={views} />
                                <PopularityInfos popularityType="comments" popularityValue={comments} />
                                <PopularityInfos popularityType="favorites" popularityValue={favorites} />
                            </PostInteractions>
                            <PostCategory>(Catégorie du post : {category})</PostCategory>
                            <PostContent>
                                {!isAuthor &&
                                    <div style={{width:"32px", height:"32px", justifySelf:"end"}}>
                                        {isFavorite ?
                                            <div onClick={favoriteVerification} style={{width:"32px", height:"32px", backgroundImage:`url(${favorite})`}}></div>
                                            : <div onClick={favoriteVerification} style={{width:"32px", height:"32px", backgroundImage:`url(${favoriteUnselected})`}}></div>}
                                    </div>}
                                <PostAuthor>Posté par <Link to={`/profile/${user}`}>{user}</Link>, le {date}</PostAuthor>
                                {modifiedDate && <PostAuthor style={{marginTop:"-30px"}}>(Modifié le {modifiedDate})</PostAuthor>}
                                {formattedContent?.map((sentence, index) => <p key={index}>{sentence}</p>)}
                                {image && <div style={{display:"flex", flexWrap:"wrap", width:"100%", justifyContent:"space-between"}}>
                                    {JSON.parse(image).map((currentImage, index) => <img key={index} src={`http://localhost:3000/api/${currentImage}`} alt="" style={{ maxWidth:"90%", height:"fit-content", margin:"20px"}}/>)}
                                </div>}
                                {isAuthor &&
                                    <div style={{ display:"flex", marginTop:"30px", alignItems:"center", flexWrap:"wrap"}}>
                                        <SecondaryButton onClick={() => setModifyingPost(true)} style={ {width:"150px", marginRight:"20px"} }>Modifier le post</SecondaryButton>
                                        <InteractionFalseLink onClick={() => setAskingDeletePost(true)} style={{marginTop:"15px"}}>Supprimer le post</InteractionFalseLink>
                                    </div>}
                            </PostContent>
                        </section>
                        <div style={ {marginBottom:"80px"} }>
                            {token ? <LinkForMainButton to={`/post/${id}#answerToPost`}>Répondre au post</LinkForMainButton> :
                            <MainButton onClick={() => setNeedConnexion(true)}>Répondre au post</MainButton>}
                        </div>
                        <CommentsContainer>
                            <h2 style={ {marginBottom:"30px"} }>{comments} réponse(s)</h2>
                                <div>
                                    {commentsLoading ? (
                                        <Loader/>
                                    ) :
                                    (<div>
                                        {commentsList.length > 0 && commentsList.map((comment) => (
                                        <PostContent key={comment.id}>
                                            <PostAuthor>Réponse par <Link to={`/profile/${comment.user}`}>{comment.user}</Link>, le {comment.creation_date}</PostAuthor>
                                            {comment.modification_date && <PostAuthor style={{marginTop:"-30px"}}>(Modifié le {comment.modification_date})</PostAuthor>}
                                            <p>{comment.content}</p>
                                            {!comment.isAuthor &&
                                                <div style={{marginTop:"20px",fontSize:"0.8em"}}>
                                                    {token ?
                                                    <LinkForSecondaryButton to={`/post/${comment.post_id}#answerToPost`} onClick={() => setReplyToComment(comment.id)} style={{padding:"5px 30px"}}>Répondre</LinkForSecondaryButton>:
                                                    <SecondaryButton onClick={() => setNeedConnexion(true)}>Répondre</SecondaryButton>}
                                                </div>}
                                            {comment.isAuthor &&
                                                <div style={ {display:"flex", flexWrap:"wrap", marginTop:"30px"} }>
                                                    <InteractionLink to={`/post/${comment.post_id}#modifyComment`} onClick={() => handleModifyComment(comment.id, comment.content)} style={{marginRight:"20px", marginTop:"12px"}}>Modifier le commentaire</InteractionLink>
                                                    <InteractionFalseLink onClick={()=> handleDeleteComment(comment.id)}>Supprimer le commentaire</InteractionFalseLink>
                                                </div>}
                                        </PostContent>
                                        ))}
                                    </div>)}
                            </div>
                        </CommentsContainer>
                        {modifyingComment ?
                           <div id="modifyComment">
                                <FormModifyComment
                                    id={commentToModify.id}    
                                    content={commentToModify.content}
                                    modifyingComment={modifyingComment}
                                    setModifyingComment={setModifyingComment}
                                />
                            </div>:
                            <div>
                                {token && <AnswerWrapper id="answerToPost">
                                    <form onSubmit={e => e.preventDefault()}>
                                        <h2>Répondre au post</h2>
                                        {!isFirstWritting && inputError && <p style={{color:"red"}}>Merci d'écrire un texte plus long (minimum 3 caractères)</p>}
                                        <AnswerField
                                            id="comment"
                                            rows="15"
                                            value={inputValue}
                                            onChange={handleInput}
                                            onBlur={checkIsFirst}
                                        ></AnswerField>
                                        <div><MainButton onClick={checkComment}>Envoyer ma réponse</MainButton></div>
                                    </form>
                                </AnswerWrapper>}
                            <LinkForMainButton to="/posts">Voir les autres posts</LinkForMainButton>
                            </div>}
                        
                    {askingDeletePost && <div style={{position:"fixed", width:"100vw", height:"100vh", backgroundColor:"rgba(150,150,150,0.8)", top:0, left:0}}>
                        <div style={{margin:"60px auto 0", padding:"40px 30px", boxSizing:"border-box", width:"90%", maxWidth:"800px", backgroundColor:"#ffffff"}}>
                            <h2>Attention, vous vous apprêtez à supprimer votre post !</h2>
                            <p>Êtes-vous sûr de vouloir le supprimer ? (vous ne pourrez plus revenir en arrière)</p>
                            <MainButton onClick={deletePost}style={{margin:"15px"}}>Oui, je souhaite supprimer mon post</MainButton>
                            <SecondaryButton onClick={() => setAskingDeletePost(false)} style={{margin:"15px"}}>Non, j'ai changé d'avis</SecondaryButton>
                        </div>
                    </div>}
                    {askingDeleteComment && <div style={{position:"fixed", width:"100vw", height:"100vh", backgroundColor:"rgba(150,150,150,0.8)", top:0, left:0}}>
                        <div style={{margin:"60px auto 0", padding:"40px 30px", boxSizing:"border-box", width:"90%", maxWidth:"800px", backgroundColor:"#ffffff"}}>
                            <h2>Souhaitez-vous vraiment supprimer votre commentaire ?</h2>
                            <p>(vous ne pourrez plus revenir en arrière)</p>
                            <MainButton onClick={deleteComment} style={{margin:"15px"}}>Supprimer mon commentaire</MainButton>
                            <SecondaryButton onClick={() => setAskingDeleteComment(false)} style={{margin:"15px"}}>Non, j'ai changé d'avis</SecondaryButton>
                        </div>
                    </div>}
                </div>}
            </PostWrapper>}
        </div>
    )
}

export default Post