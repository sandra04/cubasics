import {  useState } from 'react'
import styled from 'styled-components'

import { MainButton, SecondaryButton } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { formatDate, encodeStringInput } from '../../utils/tools'



const AnswerField = styled.textarea`
    width:90%;
    margin:0 auto 40px;
`

function FormModifyMessage({ id, content, image, setModifyingMessage }){
    const { token, setToken } = useToken()

    const [inputValue, setInputValue] = useState(content)
    const [error, setError] = useState(false)



    async function sendMessage(){
       
        const currentDate = new Date()
        const currentDateFormatted = formatDate(currentDate)

        const messageData = {
            id: id,
            content: encodeStringInput(inputValue),
            modificationDate: currentDateFormatted,
            image: null
        }

        try {
            const res = await fetch("http://localhost:3000/api/message/modify", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(messageData)
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
            console.log("Message modifié !")
            setModifyingMessage(false)
        }
        // Network error
        catch(err){
            console.log(err)
            setError(true)
        }
    }

    function checkMessage(e){
        e.preventDefault()
        sendMessage()
    }
    
    // Modifie la valeur dans le state local à chaque changement de saisie
    function handleInput(e) {
        let text = e.target.value
        text.replace('"', '\"')
        setInputValue(e.target.value)
	}


    return(
        <section>
            { error &&
                <div style={ {marginBottom:"60px"} }>
                    <p style={ {marginBottom:"40px", color:"red"} }>Désolé, il y a eu une erreur lors de la modification de votre message</p>
                </div>
            }
            <h2 style={ {marginBottom:"40px"} }>Modifier mon message :</h2>
            <form onSubmit={e => e.preventDefault()}>
                <AnswerField
                    id="comment"
                    rows="15"
                    value={inputValue}
                    onChange={handleInput}
                ></AnswerField>
                <div>
                    <MainButton onClick={checkMessage} style={ {margin:"15px"} }>Sauvegarder</MainButton>
                    <SecondaryButton onClick={() => setModifyingMessage(false)} style={{margin:"15px"}}>Annuler la modification</SecondaryButton>
                </div>
            </form>
        </section>
    )
}

export default FormModifyMessage