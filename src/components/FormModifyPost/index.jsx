import {  useState, useEffect } from 'react'
import styled from 'styled-components'
import { MainButton, SecondaryButton } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { checkLengthEnough, formatDate, validateIsGoodFormat, validateIsGoodSize, encodeStringInput } from '../../utils/tools'

import Connexion from '../../pages/Connexion'
// import { createPath } from 'react-router-dom'



const PostTitle = styled.input`
    width:80%;
    margin:0 auto 40px;
`

const PostField = styled.textarea`
    width:80%;
    margin:0 auto 40px;
`


function FormModifyPost({ id, title, category, content, image, audio, setModifyingPost }){
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

    const { token, setToken } = useToken()
    const [titleValue, setTitleValue] = useState(title)
    const [postValue, setPostValue] = useState(content)
    const [titleError, setTitleError] = useState('')
    const [postError, setPostError] = useState('')
    const [titleIsFirstWritting, setTitleFirstWritting] = useState(true)
    const [postIsFirstWritting, setPostFirstWritting] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState(category)
    const [postImage, setPostImage] = useState(image ? JSON.parse(image) : [])
    // const [postImageBase64, setPostImageBase64] = useState([])
    const [imageInput, setImageInput] = useState([])
    const [imageTooBig, setImageTooBig] = useState(false)
    const [imageBadFormat, setImageBadFormat] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        setTitleError(!checkLengthEnough(titleValue, 10))
    }, [titleValue])
    useEffect(() => {
        setPostError(!checkLengthEnough(postValue, 30))
    }, [postValue])
    /*useEffect(() => {
        console.log("Mes anciennes images : ", postImageBase64)
        if (postImageBase64.length === postImage.length){
            modifyPost()
        }
    }, [postImageBase64]);*/



    if(!token){
        return <Connexion/>
    }

    async function modifyPost(){
       const currentDate = new Date()

        const currentDateFormatted = formatDate(currentDate)
    
        const postData = {
            id:id,
            title: encodeStringInput(titleValue),
            content: encodeStringInput(postValue),
            category: selectedCategory,
            modificationDate: currentDateFormatted,
            oldImage: postImage.length > 0 ? postImage : [],
            newImage: imageInput.length > 0 ? imageInput : null,
            /*image: (imageInput.length > 0 || postImage.length > 0) ? [...postImageBase64, ...imageInput] : null,*/
            audio:null
        }
        
        try {
            const res = await fetch("http://localhost:3000/api/post/modify", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(postData)
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
            console.log("Post modifié !")
            setModifyingPost(false)
           
        }
        // Network error
        catch(err){
            console.log(err)
            setError(true)
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
            
            /*let images = [...fileList]
            images.push(reader.result)
            console.log(images)
            return images*/

            // return reader.result
        }
        reader.onerror = (error) => {
          console.log('Error: ', error)
          return null
        }
    }

    async function handleImage() {
        const selectedFile = document.getElementById('post-image').files[0]
        let fieldValue = document.getElementById('post-image').value
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
        const isImage = selectedFile ? validateIsGoodFormat(selectedFile, allowedTypes) : null
        const imageIsGoodSize = selectedFile ? validateIsGoodSize(selectedFile, 4) : null
        // setImageInput([])
        if (isImage){
            setImageBadFormat(false)
            console.log("Votre fichier est au format " + selectedFile.type)
            if (imageIsGoodSize){
                // La méthode toFixed(2) permet d'arrondir à 2 chiffres après la virgule
                console.log("Votre fichier fait " + (selectedFile.size / 1024 / 1024).toFixed(2) + " Mo")
                setImageTooBig(false)
                
                try {
                    await getBase64(selectedFile)

                    /*const images = await new Promise((resolve) => {
                        resolve(getBase64(selectedFile, imageInput))
                    })
                    images.then((value) => {
                        console.log(value);
                    })*/

                    // const images = await getBase64(selectedFile, imageInput)
                    // console.log(images)
                    // let images = [...imageInput]
                    // images.push(currentImage)
                    // setImageInput([...images])
                }
                catch(error) {
                    console.error(error);
                    return
                }
            }
            else{
                console.log('Votre image est trop grande :' + (selectedFile.size / 1024 / 1024).toFixed(2) + " Mo. Merci d'importer une image de moins de 4 Mo")
                fieldValue = ''
                setImageTooBig(true)
            }
        }
        else if (isImage === null){
            setImageBadFormat(false)
            setImageTooBig(false)
        }
        else {
            console.log('Invalid file type. Please upload a JPEG or PNG file.')
            setImageBadFormat(true)
            setImageTooBig(false)
            fieldValue = ''
        }
    }

    function postImageDelete(e){
        let image = e.target.src.split("http://localhost:3000/api/").pop()
        image = "./" + image
        const filteredImages = postImage.filter((currentImage) => currentImage !== image)
        setPostImage([...filteredImages])
    }
    function inputImageDelete(e){
        const image = e.target.src
        const filteredImages = imageInput.filter((currentImage) => currentImage !== image)
        setImageInput([...filteredImages])
    }

    /*function preparePreviousImages(){
        const previousPostImages = document.getElementsByClassName("previous-post-image")

        Array.from(previousPostImages).forEach((imageToTransform) => {
            fetch(imageToTransform.src)
            .then((res) => res.blob())
            .then((blob) => {
                // Read the Blob as DataURL using the FileReader API
                const reader = new FileReader()
                reader.readAsDataURL(blob)
                reader.onload = () => {
                    console.log(reader.result)
                    let images = [...postImageBase64]
                    images.push(reader.result)
                    setPostImageBase64([...images])
                    console.log("Anciennes images : ", postImageBase64)
                }
                reader.onerror = (error) => {
                console.log('Error: ', error)
                return null
                }
            });
        })
    }*/
    

    function checkFields(e){
        e.preventDefault();
        setTitleFirstWritting(false)
        setPostFirstWritting(false)
        setTitleError(!checkLengthEnough(titleValue, 10))
        setPostError(!checkLengthEnough(postValue, 30))
        
        if(!titleError && !postError && selectedCategory){
            modifyPost()
            /*if (postImage.length > 0){
                preparePreviousImages()
            }
            else{
                modifyPost()
            }*/
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
        <section>
            { error &&
                <div style={ {marginBottom:"60px"} }>
                    <p style={ {marginBottom:"40px", color:"red"} }>Désolé, il y a eu une erreur lors de la modification de votre post</p>
                    <SecondaryButton onClick={() => setModifyingPost(false)}>Retourner sur mon post</SecondaryButton>
                </div>
            }
            <h2 style={ {marginBottom:"40px"} }>Modifier le post :</h2>
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
                <div>
                    <div style={ {marginBottom:"15px", marginTop:"50px"} }><label htmlFor="post-field">Contenu du post * :</label></div>
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
                    <div style={ {marginBottom:"15px"} }><label htmlFor="post-field">Ajouter une image (png ou jpg, moins de 4Mo) :</label></div>
                    {imageBadFormat && <p style={{color:"red"}}>Votre fichier n'est pas au bon format. Merci d'importer une image au format PNG ou JPG</p>}
                    {imageTooBig && <p style={{color:"red"}}>Votre image est trop grande. Merci d'importer une image avec une taille inférieure à 4 Mo.</p>}
                    <input type="file" id="post-image" name="post-image" accept="image/png, image/jpeg, image/jpg" onChange={handleImage}/>
                    <div id="preview"></div>
                    {postImage.length > 0 && postImage.map((currentImage) => <img className="previous-post-image" src={`http://localhost:3000/api/${currentImage}`} alt="" onClick={postImageDelete}/>)}
                    {imageInput.length > 0 && imageInput.map((currentImage) => <img src={currentImage} alt="" onClick={inputImageDelete}/>)}
                </div>
                <div>
                    <MainButton onClick={checkFields} style={ {margin:"15px"} }>Sauvegarder</MainButton>
                    <SecondaryButton onClick={() => setModifyingPost(false)} style={{margin:"15px"}}>Annuler la modification</SecondaryButton>
                </div>
            </form>
        </section>
    )
}

export default FormModifyPost