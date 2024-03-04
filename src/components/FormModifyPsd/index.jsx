import {  useState } from 'react'
import styled from 'styled-components'
import { MainButton, SecondaryButton } from '../../utils/styles/Atoms'

import { checkIsSecurized, encodeStringInput } from '../../utils/tools'
import { useToken } from '../../utils/hooks'



const ConnexionField = styled.input`
    width:80%;
    margin:0 auto;
`


function FormModifyPsd({modifyingPsd, setModifyingPsd}){
    const { token, setToken } = useToken()
    const [passwordInput, setPasswordInput] = useState("")
    const [newPasswordInput, setNewPasswordInput] = useState("")
    const [newPasswordError, setNewPasswordError] = useState(false)
    const [error, setError] = useState(false)


    async function modifyPsd(){
       
        const userData = {
            password: encodeStringInput(passwordInput),
            newPassword: encodeStringInput(newPasswordInput)
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_PATH}/api/user/modify_psd`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData)
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
            setPasswordInput("")
            setNewPasswordInput("")
            setNewPasswordError(false)
            setModifyingPsd(false)
           
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }

    // Modifie la valeur dans le state local à chaque changement de saisie
    function handlePassword() {
        const newPasswordInputValue = document.getElementById("new-password").value
        const isSecurized = checkIsSecurized(newPasswordInputValue)
        setNewPasswordError(!isSecurized)
        if(!newPasswordError){
            setNewPasswordInput(newPasswordInputValue)
        }
        else{
            setNewPasswordInput("")
        }
    }

    function checkFields(e){
        e.preventDefault();
        handlePassword()

        if(passwordInput && newPasswordInput && !newPasswordError){
            modifyPsd()
        }
    } 


    return(
        <section style={{textAlign:"center", margin:"60px auto 0"}}>
            { error &&
                <div style={ {marginBottom:"60px"} }>
                    <p style={ {marginBottom:"40px", color:"red"} }>Désolé, il y a eu une erreur lors de la modification de votre mot de passe</p>
                    <SecondaryButton onClick={() => setModifyingPsd(false)}>Retourner sur mon profil</SecondaryButton>
                </div>
            }
            <h2 style={ {marginBottom:"40px"} }>Modifier mon mot de passe :</h2>
            <form onSubmit={e => e.preventDefault()}>
            <div>
                    <div style={ {marginBottom:"15px", fontWeight:"700"} }><label htmlFor="password">Mot de passe actuel :</label></div>
                    <ConnexionField style={ {marginBottom:"50px"} }
                        name="password"
                        type="password"
                        id="password"
                        onChange={(e) => setPasswordInput(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <div style={ {marginBottom:"15px", fontWeight:"700"} }><label htmlFor="new-password">Nouveau mot de passe :</label></div>
                    {newPasswordError && <p style={ {color:"red"} }>Merci d'utiliser un mot de passe avec au moins 8 caractères et au moins 1 minuscule, 1 majuscule, 1 nombre et 1 caractère spécial</p>}
                    <ConnexionField style={ {marginBottom:"50px"} }
                        name="new-password"
                        type="password"
                        id="new-password"
                        onChange={handlePassword}
                        required
                    />
                </div>
                <div>
                    <MainButton onClick={checkFields} style={ {margin:"15px"} }>Sauvegarder</MainButton>
                    <SecondaryButton onClick={() => setModifyingPsd(false)} style={{margin:"15px"}}>Annuler la modification</SecondaryButton>
                </div>
            </form>
        </section>
    )
}

export default FormModifyPsd