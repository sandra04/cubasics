import {  useState } from 'react'
import styled from 'styled-components'

import { MainButton, SecondaryButton } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { encodeStringInput, fetchData } from '../../utils/tools'

import Connexion from '../../pages/Connexion'



const PresentationField = styled.textarea`
    width:80%;
    margin:0 auto 40px;
`


function FormModifyPresentation({ presentation, modifyingPresentation, setModifyingPresentation }){
    const { token, setToken } = useToken()

    const [presentationValue, setPresentationValue] = useState(presentation ? presentation : null)
    const [error, setError] = useState(false)


    if(!token){
        return <Connexion/>
    }


    async function modifyPresentation(){
       
        const userData = {
            presentation: encodeStringInput(presentationValue)
        }

        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/user/modify_presentation`, userData, "identified")
           
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
            setModifyingPresentation(false)
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }


    // Modifie la valeur dans le state local à chaque changement de saisie
    function handlePresentation(e) {
        setPresentationValue(e.target.value)
    }


    function checkFields(e){
        e.preventDefault();
        modifyPresentation()
    } 


    return(
        <section>
            { error &&
                <div style={ {marginBottom:"60px"} }>
                    <p style={ {marginBottom:"40px", color:"red"} }>Désolé, il y a eu une erreur lors de la modification de votre texte de présentation</p>
                    <SecondaryButton onClick={() => setModifyingPresentation(false)}>Retourner sur mon profil</SecondaryButton>
                </div>
            }
            <h2 style={ {marginBottom:"40px"} }>Modifier mon texte de présentation :</h2>
            <form onSubmit={e => e.preventDefault()}>
                <div>
                    <div style={ {marginBottom:"15px"} }><label htmlFor="title">Ma présentation * :</label></div>
                    <PresentationField  
                        name="presentation"
                        type="text"
                        id="presentation"
                        minLength={10}
                        maxLength={250}
                        rows="8"
                        value={presentationValue}
                        onChange={handlePresentation}
                        required
                    />
                </div>
                <div>
                    <MainButton onClick={checkFields} style={ {margin:"15px"} }>Sauvegarder</MainButton>
                    <SecondaryButton onClick={() => setModifyingPresentation(false)} style={{margin:"15px"}}>Annuler la modification</SecondaryButton>
                </div>
            </form>
        </section>
    )
}

export default FormModifyPresentation