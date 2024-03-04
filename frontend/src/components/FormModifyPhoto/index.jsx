import {  useState } from 'react'
import { MainButton, SecondaryButton } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { validateIsGoodFormat, validateIsGoodSize, fetchData } from '../../utils/tools'

import Connexion from '../../pages/Connexion'



function FormModifyPhoto({ photo, modifyingPhoto, setModifyingPhoto }){
    const { token, setToken } = useToken()

    const [profilePhoto, setProfilePhoto] = useState(photo ? photo : null)
    const [photoInput, setPhotoInput] = useState(null)
    const [imageTooBig, setImageTooBig] = useState(false)
    const [imageBadFormat, setImageBadFormat] = useState(false)
    const [error, setError] = useState(false)


    if(!token){
        return <Connexion/>
    }


    async function modifyPhoto(){
         const userData = {
             photo: photoInput ? photoInput : profilePhoto
         }
        
         try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/user/modify_photo`, userData, "identified")
         
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

            setModifyingPhoto(false)    
         }
         // Network error
         catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
             setError(true)
         }
     }


    function getBase64(file) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            setPhotoInput(reader.result)
        }
        reader.onerror = (error) => {
            if (process.env.REACT_APP_SHOW_LOGS) { console.log('Error: ', error) }
          return null
        }
    }


    async function handleImage() {
        const selectedFile = document.getElementById('profile-photo').files[0]
        let fieldValue = document.getElementById('profile-photo').value
       
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
        const isImage = selectedFile ? validateIsGoodFormat(selectedFile, allowedTypes) : null
        const imageIsGoodSize = selectedFile ? validateIsGoodSize(selectedFile, 4) : null
        // setImageInput([])
        if (isImage){
            setImageBadFormat(false)
            if (imageIsGoodSize){
                setImageTooBig(false)
                
                try {
                    await getBase64(selectedFile)
                    setProfilePhoto(null)
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

    function profilePhotoDelete(e){
        setProfilePhoto(null)
    }
    function inputPhotoDelete(e){
        setPhotoInput(null)
    }

    function checkFields(e){
        e.preventDefault();
        modifyPhoto()
    } 

    return(
        <section>
            { error &&
                <div style={ {marginBottom:"60px"} }>
                    <p style={ {marginBottom:"40px", color:"red"} }>Désolé, il y a eu une erreur lors de la modification de votre photo</p>
                    <SecondaryButton onClick={() => setModifyingPhoto(false)}>Retourner sur mon profil</SecondaryButton>
                </div>
            }
            <h2 style={ {marginBottom:"40px"} }>Modifier ma photo de profil :</h2>
            <form onSubmit={e => e.preventDefault()}>
                <div style={ {marginBottom:"60px"} }>
                    <div style={ {marginBottom:"15px"} }><label htmlFor="post-field">Ajouter une image (png ou jpg, moins de 4Mo) :</label></div>
                    {imageBadFormat && <p style={{color:"red"}}>Votre fichier n'est pas au bon format. Merci d'importer une image au format PNG ou JPG</p>}
                    {imageTooBig && <p style={{color:"red"}}>Votre image est trop grande. Merci d'importer une image avec une taille inférieure à 4 Mo.</p>}
                    <input type="file" id="profile-photo" name="profile-photo" accept="image/png, image/jpeg, image/jpg" onChange={handleImage}/>
                    <div id="preview"></div>
                    {profilePhoto && <img className="previous-photo" src={`http://localhost:3000/api/${profilePhoto}`} alt="" onClick={profilePhotoDelete}/>}
                    {photoInput && <img src={photoInput} alt="" onClick={inputPhotoDelete}/>}
                </div>
                <div>
                    <MainButton onClick={checkFields} style={ {margin:"15px"} }>Sauvegarder</MainButton>
                    <SecondaryButton onClick={() => setModifyingPhoto(false)} style={{margin:"15px"}}>Annuler la modification</SecondaryButton>
                </div>
            </form>
        </section>
    )
}

export default FormModifyPhoto