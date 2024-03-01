import {  useState, useEffect } from 'react'
import styled from 'styled-components'

import { MainButton, SecondaryButton } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { checkLengthEnough, formatDate, encodeStringInput } from '../../utils/tools'

import Connexion from '../../pages/Connexion'



const AnswerField = styled.textarea`
    width:90%;
    margin:0 auto 40px;
`

function FormModifyComment({ id, content, modifyingComment, setModifyingComment }){
    const { token, setToken } = useToken()

    const [inputValue, setInputValue] = useState(content)
    const [inputError, setInputError] = useState(false)
    const [isFirstWritting, setFirstWritting] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        setInputError(!checkLengthEnough(inputValue, 3))
    }, [inputValue])


    if(!token){
        return <Connexion/>
    }


    async function sendComment(){
       
        const currentDate = new Date()
        const currentDateFormatted = formatDate(currentDate)

        const commentData = {
            id: id,
            content: encodeStringInput(inputValue),
            modificationDate: currentDateFormatted,
            image: null,
            audio: null
        }
          
        try {
            const res = await fetch("http://localhost:3000/api/comment/modify", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(commentData)
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
            console.log("Commentaire modifié !")
            setModifyingComment(false)
        }
        // Network error
        catch(err){
            console.log(err)
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


    return(
        <section>
            { error &&
                <div style={ {marginBottom:"60px"} }>
                    <p style={ {marginBottom:"40px", color:"red"} }>Désolé, il y a eu une erreur lors de la modification de votre commentaire</p>
                </div>
            }
            <h2 style={ {marginBottom:"40px"} }>Modifier mon commentaire :</h2>
            <form>
                {!isFirstWritting && inputError && <p style={{color:"red"}}>Merci d'écrire un texte plus long (minimum 3 caractères)</p>}
                <AnswerField
                    id="comment"
                    rows="15"
                    value={inputValue}
                    onChange={handleInput}
                    onBlur={checkIsFirst}
                ></AnswerField>
                <div>
                    <MainButton onClick={checkComment} style={ {margin:"15px"} }>Sauvegarder</MainButton>
                    <SecondaryButton onClick={() => setModifyingComment(false)} style={{margin:"15px"}}>Annuler la modification</SecondaryButton>
                </div>
            </form>
        </section>
    )
}

export default FormModifyComment