import {  useState, useEffect } from 'react'
import styled from 'styled-components'

import { MainButton, LinkForMainButton, LinkForSecondaryButton, Loader } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { checkLengthEnough, formatDate, validateIsGoodFormat, validateIsGoodSize, fetchData } from '../../utils/tools'

import Connexion from '../Connexion'

import PageTitle from '../../components/PageTitle'



const PostWrapper = styled.div`
    width:90%;
    margin:0 auto 150px;
    text-align:center;
    padding-top:60px;
`
const PostTitle = styled.input`
    width:80%;
    margin:0 auto 40px;
`

const PostField = styled.textarea`
    width:80%;
    margin:0 auto 40px;
`


function NewPost() {
    const { token, setToken } = useToken()
    
    const [titleValue, setTitleValue] = useState('')
    const [postValue, setPostValue] = useState('')
    const [titleError, setTitleError] = useState('')
    const [postError, setPostError] = useState('')
    const [titleIsFirstWritting, setTitleFirstWritting] = useState(true)
    const [postIsFirstWritting, setPostFirstWritting] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState("")

    const [imageInput, setImageInput] = useState([])
    const [imageTooBig, setImageTooBig] = useState(false)
    const [imageBadFormat, setImageBadFormat] = useState(false)

    const [isDataSending, setDataSending] = useState(false)
    const [isFormOk, setIsFormOk] = useState(false)
    const [error, setError] = useState(false)


    const categories = [
        "paramétrage global",
        "prise de son",
        "instruments virtuels",
        "compresseur",
        "equalizer",
        "mastering",
        "composition",
        "autre"
    ]


    useEffect(() => {
        setTitleError(!checkLengthEnough(titleValue, 10))
    }, [titleValue])
    useEffect(() => {
        setPostError(!checkLengthEnough(postValue, 30))
    }, [postValue])



    if(!token){
        return <Connexion/>
    }



    async function sendPost(title, content, category){
        
        setDataSending(true)

        const currentDate = new Date()

        const currentDateFormatted = formatDate(currentDate)

        const postData = {
            title: title,
            content: content,
            category: category,
            creationDate: currentDateFormatted,
            image: imageInput.length > 0 ? imageInput : null,
            audio:null
        }
          
        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/post/create_new_post`, postData, "identified")
        
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
    function handlePost(e) {
        setPostValue(e.target.value)
    }
    function handleTitle(e) {
        setTitleValue(e.target.value)
    }

    function getBase64(file) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            let images = [...imageInput]
            images.push(reader.result)
            setImageInput([...images])
        }
        reader.onerror = (error) => {
            if (process.env.REACT_APP_SHOW_LOGS) { console.log('Error: ', error) }
          return null
        }
    }

     
    async function handleImage() {
        const selectedFile = document.getElementById('post-image').files[0]
        let fieldValue = document.getElementById('post-image').value
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
        const isImage = selectedFile ? validateIsGoodFormat(selectedFile, allowedTypes) : null
        const imageIsGoodSize = selectedFile ? validateIsGoodSize(selectedFile, 4) : null

        if (isImage){
            setImageBadFormat(false)
            
            if (imageIsGoodSize){
                setImageTooBig(false)
                
                try {
                    await getBase64(selectedFile)
                }
                catch(error) {
                    console.error(error);
                    return
                }
            }
            else{
                fieldValue = ''
                setImageTooBig(true)
            }
        }
        else if (isImage === null){
            setImageBadFormat(false)
            setImageTooBig(false)
        }
        else {
            setImageBadFormat(true)
            setImageTooBig(false)
            fieldValue = ''
        }
    }

    function imageDelete(e){
        const image = e.target.src
        const filteredImages = imageInput.filter((currentImage) => currentImage !== image)
        setImageInput([...filteredImages])
    }

    function checkFields(e){
        e.preventDefault()
        setTitleFirstWritting(false)
        setPostFirstWritting(false)
        setTitleError(!checkLengthEnough(titleValue, 10))
        setPostError(!checkLengthEnough(postValue, 30))

        if(!titleError && !postError && selectedCategory){
            sendPost(titleValue, postValue, selectedCategory)
        }
        else{
            setIsFormOk(false)
        }

    } 

    // Lorsqu'on sort de l'input (lancé sur "onBlur")
    function postCheckIsFirst(){
        if (postIsFirstWritting){
            setPostFirstWritting(false)
        }
    }
    function titleCheckIsFirst(){
        if (titleIsFirstWritting){
            setTitleFirstWritting(false)
        }
    }


    return(
        <PostWrapper>
            <PageTitle title="Cubasics - Créer un nouveau post" />
            {isDataSending ? (
                <Loader/>
            ) :
            (<div>
                { error &&
                    <div style={ {marginBottom:"60px"} }>
                        <p style={ {marginBottom:"40px", color:"red"} }>Désolé, il y a eu une erreur lors de l'envoi de votre post</p>
                        <LinkForSecondaryButton to="/posts">Voir les autres posts</LinkForSecondaryButton>
                    </div>
                }
                <h1 style={ {marginBottom:"40px"} }>Nouveau post :</h1>
                
                {!isFormOk ? (
                    <form onSubmit={e => e.preventDefault()}>
                        <div>
                        <div style={ {marginBottom:"15px"} }><label htmlFor="title">Titre du post * :</label></div>
                            {!titleIsFirstWritting && titleError && <p style={{color:"red"}}>Merci d'écrire un titre plus long (minimum 10 caractères)</p>}
                            <PostTitle
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
                            <div style={ {marginBottom:"15px"} }><label htmlFor="post-field">Contenu du post * :</label></div>
                            {!postIsFirstWritting && postError && <p style={{color:"red"}}>Merci d'écrire un texte plus long (minimum 30 caractères)</p>}
                            <PostField
                                id="post-field"
                                rows="15"
                                minLength={30}
                                value={postValue}
                                onChange={handlePost}
                                onBlur={postCheckIsFirst}
                                required
                            />
                        </div>
                        <div style={ {marginBottom:"60px"} }>
                            <div style={ {marginBottom:"15px"} }><label htmlFor="category">Catégorie * :</label></div>
                            {!selectedCategory && <p style={{color:"red"}}>Merci de sélectionner une catégorie</p>}
                            <select
                                name="category"
                                id="category"
                                required
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">--Sélectionner une catégorie --</option>
                                {categories.map((category, index) =>
                                    <option key={index} value={category}>{category}</option>
                                )}
                            </select>
                        </div>
                        <div style={ {marginBottom:"60px"} }>
                            <div style={ {marginBottom:"15px"} }><label htmlFor="post-field">Ajouter une image (png ou jpg, moins de 4Mo) :</label></div>
                            {imageBadFormat && <p style={{color:"red"}}>Votre fichier n'est pas au bon format. Merci d'importer une image au format PNG ou JPG</p>}
                            {imageTooBig && <p style={{color:"red"}}>Votre image est trop grande. Merci d'importer une image avec une taille inférieure à 4 Mo.</p>}
                            <input type="file" id="post-image" name="post-image" accept="image/png, image/jpeg, image/jpg" onChange={handleImage}/>
                            {imageInput.length > 0 && imageInput.map((image) => <img src={image} alt="" onClick={imageDelete}/>)}
                        </div>
                        <div><MainButton onClick={checkFields}>Publier mon post</MainButton></div>
                    </form>
                ) : (
                
                    <div>
                        <p style={ {marginBottom:"40px"} }>Merci ! Votre post a bien été envoyé</p>
                        <LinkForMainButton to="/posts">Voir les autres posts</LinkForMainButton>
                    </div>
                )}
            </div>)}  
        </PostWrapper>
    )
}

export default NewPost