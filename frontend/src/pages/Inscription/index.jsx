import styled from 'styled-components'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { MainButton, LinkForMainButton, LinkForSecondaryButton, Loader } from '../../utils/styles/Atoms'

import { checkLengthEnough, checkIsSecurized, formatDate, fetchData } from '../../utils/tools'

import PageTitle from '../../components/PageTitle'



const ConnexionWrapper = styled.main`
    width:90%;
    margin:0 auto 150px;
    padding-top:60px;
    text-align:center;
    @media (min-width:1024px){
        width:60%;
        max-width:800px;
    }
`
const ConnexionField = styled.input`
    width:80%;
    margin:0 auto;
`

function Inscription() {
    const currentDate = Date.now()

    const [nameInput, setNameInput] = useState("")
    const [firstnameInput, setFirstnameInput] = useState("")
    const [birthdateInput, setBirthdateInput] = useState("")
    const [pseudoInput, setPseudoInput] = useState("")

    const [isAdult, setIsAdult] = useState(true)
    const [pseudoError, setPseudoError] = useState(false)
    const [pseudoExists, setPseudoExists] = useState(false)
    const [pseudoIsFirstWritting, setPseudoIsFirstWritting] = useState(true)
    const [emailIsFirstWritting, setEmailIsFirstWritting] = useState(true)
    const [emailError, setEmailError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const[unauthorized, setUnauthorized] = useState(false)

    const [isDataSending, setDataSending] = useState(false)
    const [isFormOk, setIsFormOk] = useState(false)
    const [error, setError] = useState(false)



    async function createUser(emailValue, passwordValue){
        
        setDataSending(true)

        const today = new Date()
        const currentDateFormatted = formatDate(today)

        const userData = {
            name: nameInput,
            firstName: firstnameInput,
            birthDate: birthdateInput,
            pseudo: pseudoInput,
            email: emailValue,
            password: passwordValue,
            inscriptionDate: currentDateFormatted,
            photo:null
        }

        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/user/signup`, userData, null)
        
            // http error
            if (!res.ok) {
                if (res.status === 401){
                    setUnauthorized(true)
                }
                else{
                    const message = `An error has occured: ${res.status} - ${res.statusText}`;
                    setError(true)
                    throw new Error(message);
                }
            }
            setError(false)
            setUnauthorized(false)
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


    async function searchPseudo(){
       const pseudoValue = document.getElementById("pseudo").value
        const userData = {
            pseudo: pseudoValue
        }
          
        try {
            const res = await fetchData(`${process.env.REACT_APP_API_PATH}/api/user/get_pseudo`, userData, null)

            // http error
            if (!res.ok) {
                const message = `An error has occured: ${res.status} - ${res.statusText}`;
                setError(true)
                throw new Error(message);
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
        
                if (result.data.pseudo !== "") {
                    setPseudoExists(true)
                }
                else{
                    setPseudoExists(false)
                }
            }
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }


    function handleName(e) {
        setNameInput(e.target.value)
    }

    function handleFirstname(e) {
        setFirstnameInput(e.target.value)
    }

    function evaluateDate() {
        const birthdayValue = document.getElementById("birthdate").value
        const birthday = new Date(birthdayValue)
        const diffTime = currentDate - birthday.getTime()
        const diffAge = new Date(diffTime)
        const age = diffAge.getFullYear() - 1970
        
        if(age < 18){
            setIsAdult(false)
            setBirthdateInput("")
        }
        else{
            setIsAdult(true)
            setBirthdateInput(birthdayValue)
        }
      
    }

    function testPseudo() {
        const inputPseudoValue = document.getElementById("pseudo").value
        setPseudoError(!checkLengthEnough(inputPseudoValue, 3))
        searchPseudo(inputPseudoValue)

        if (!pseudoExists && !pseudoError){
            setPseudoInput(inputPseudoValue)
        }
        else{
            setPseudoInput("")
        }
    }
    function pseudoCheckIsFirst(){
        if (pseudoIsFirstWritting) {
            setPseudoIsFirstWritting(false)
        }
        testPseudo()
    }

    function checkEmail(){
        const emailInputValue = document.getElementById("email").value
        setEmailError(!emailInputValue.includes("@"))
    }
    function emailCheckIsFirst(){
        if (emailIsFirstWritting) {
            setEmailIsFirstWritting(false)
        }
    }

    function handlePassword() {
        const passwordInputValue = document.getElementById("password").value
        const isSecurized = checkIsSecurized(passwordInputValue)
        setPasswordError(!isSecurized)
    }

    function checkFields(e){
        e.preventDefault()
        setPseudoIsFirstWritting(false)
        setEmailIsFirstWritting(false)
        evaluateDate()
        testPseudo()

        const emailValue = document.getElementById("email").value
        const passwordValue = document.getElementById("password").value

        checkEmail()
        handlePassword()


        if(nameInput && firstnameInput && isAdult && !pseudoError && !pseudoExists && !emailError && !passwordError){
            createUser(emailValue, passwordValue)
        }
        else{

            setIsFormOk(false)
        }

    }


    return(
        <ConnexionWrapper>
            <PageTitle title="Cubasics - Inscription au forum" />
            {isDataSending ? (
                <Loader/>
            ) : (
            <div>
                { error &&
                    <div style={ {marginBottom:"60px"} }>
                        <p style={ {marginBottom:"40px", color:"red"} }>Désolé, il y a eu une erreur lors de l'envoi de votre formulaire</p>
                    </div>
                }
                { unauthorized &&
                    <div style={ {marginBottom:"60px"} }>
                        <p style={ {marginBottom:"20px", color:"red"} }>Désolé, il y a eu une erreur lors de l'envoi de votre formulaire</p>
                        <p style={ {marginBottom:"40px", color:"red"} }>Peut-être êtes-vous déjà inscrit sur notre forum ?</p>
                        <p style={ {marginBottom:"40px", color:"red"} }>Si vous pensez être déjà inscrit, <Link to="/connexion">connectez-vous</Link></p>
                    </div>
                }
                <h1 style={ {marginBottom:"50px"} }>Inscription</h1>
                {!isFormOk ?
                    <div>
                        <form onSubmit={e => e.preventDefault()}>
                            <div>
                                <div style={ {marginBottom:"15px", fontWeight:"700"} }><label htmlFor="name">Nom :</label></div>
                                <ConnexionField style={ {marginBottom:"40px"} }
                                    name="name"
                                    type="text"
                                    id="name"
                                    value={nameInput}
                                    onChange={handleName}
                                    required
                                />
                            </div>
                            <div>
                                <div style={ {marginBottom:"15px", fontWeight:"700"} }><label htmlFor="first-name">Prénom :</label></div>
                                <ConnexionField style={ {marginBottom:"40px"} }
                                    name="firstname"
                                    type="text"
                                    id="firstname"
                                    value={firstnameInput}
                                    onChange={handleFirstname}
                                    required
                                />
                            </div>
                            <div>
                                <div style={ {marginBottom:"15px", fontWeight:"700"} }><label htmlFor="pseudo">Pseudo :</label></div>
                                {!pseudoIsFirstWritting && pseudoError && <p style={ {color:"red"} }>Merci de choisir un pseudo contenant minimum 3 caractères</p> }
                                {!pseudoIsFirstWritting && pseudoExists && <p style={ {color:"red"} }>Désolé, ce pseudo existe déjà. Merci d'en indiquer un autre</p> }
                                {!pseudoIsFirstWritting && !pseudoExists && <p style={ {color:"green"} }>Ce pseudo est disponible</p> }
                                <ConnexionField style={ {marginBottom:"40px"} }
                                    name="pseudo"
                                    type="text"
                                    id="pseudo"
                                    onChange={testPseudo}
                                    onBlur = {pseudoCheckIsFirst}
                                    required
                                />
                            </div>
                            <div>
                                <div style={ {marginBottom:"15px", fontWeight:"700"} }><label htmlFor="birthdate">Date de naissance :</label></div>
                                {!isAdult && <p style={ {color:"red"} }>Désolé, vous êtes trop jeune pour vous inscrire</p> }
                                <ConnexionField style={ {marginBottom:"40px"} }
                                    name="birthdate"
                                    type="date"
                                    id="birthdate"
                                    onBlur = {evaluateDate}
                                    required
                                />
                            </div>
                            <div>
                                <div style={ {marginBottom:"15px", fontWeight:"700"} }><label htmlFor="email">Email :</label></div>
                                {!emailIsFirstWritting && emailError && <p style={ {color:"red"} }>Merci d'entrer une adresse email valide</p>}
                                <ConnexionField style={ {marginBottom:"40px"} }
                                    name="email"
                                    type="email"
                                    id="email"
                                    onChange={checkEmail}
                                    onBlur = {emailCheckIsFirst}
                                    required
                                />
                            </div>
                            <div>
                                <div style={ {marginBottom:"15px", fontWeight:"700"} }><label htmlFor="password">Mot de passe :</label></div>
                                {passwordError && <p style={ {color:"red"} }>Merci d'utiliser un mot de passe avec au moins 8 caractères et au moins 1 minuscule, 1 majuscule, 1 nombre et 1 caractère spécial</p>}
                                <ConnexionField style={ {marginBottom:"50px"} }
                                    name="password"
                                    type="password"
                                    id="password"
                                    onChange={handlePassword}
                                    required
                                />
                            </div>
                            <MainButton id="validate-button" onClick={checkFields}>Je m'inscris</MainButton>
                        </form>
                        <div style={ {marginTop:"80px", backgroundColor:"#FFFFFF", padding:"30px"} }>
                            <p style={ {fontWeight:700, marginBottom:"30px"} }>Vous avez déjà un compte ?</p>
                            <LinkForSecondaryButton to="/connexion">Je me connecte</LinkForSecondaryButton>
                        </div>
                    </div> :
                    <div>
                        <p style={ {marginBottom:"40px"} }>Merci ! Votre inscription a bien été prise en compte</p>
                        <LinkForMainButton to="/connexion">Me connecter</LinkForMainButton>
                    </div>}
                </div>)}
        </ConnexionWrapper>
    )
}

export default Inscription