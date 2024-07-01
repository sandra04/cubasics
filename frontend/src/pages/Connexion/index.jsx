import {  useState } from 'react'
import styled from 'styled-components'

import { MainButton, LinkForSecondaryButton } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { encodeStringInput, fetchData } from '../../utils/tools'

import UserProfile from '../UserProfile'

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

function Connexion() {
    const { token, setToken } = useToken()
    const [error, setError] = useState(false)


    async function login(email, password){

        const connexionData = {
            email:encodeStringInput(email),
            password:encodeStringInput(password)
        }

        try {
            const res = await fetchData(`/api/user/login`, connexionData, null)
        
            // http error
            if (!res.ok) {
                const message = `An error has occured: ${res.status} - ${res.statusText}`;
                setError(true)
                localStorage.setItem('token', "")
                setToken(localStorage.getItem('token'))
                throw new Error(message);
            }
            const data = await res.json();
            localStorage.setItem('token', data.token)
            setToken(localStorage.getItem('token'))
            setError(false)
           
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
            localStorage.setItem('token', "")
            setToken(localStorage.getItem('token'))
        }
    }

    function askConnect(e){
        e.preventDefault()
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value
        
        login(email, password)
    }


    return(
        <div>
            <PageTitle title="Cubasics - Connexion" />
            {token ?
                <UserProfile/>:
                <ConnexionWrapper>
                    { error &&
                        <div style={ {marginBottom:"60px"} }>
                            <p style={ {marginBottom:"40px", color:"red"} }>Erreur d'identifiant ou mot de passe</p>
                        </div>
                    }
                    <h1 style={ {marginBottom:"50px"} }>Connexion</h1>
                    <form onSubmit={e => e.preventDefault()}>
                        <div>
                            <div style={ {marginBottom:"15px", fontWeight:"700"} }><label htmlFor="email">Email :</label></div>
                            <ConnexionField style={ {marginBottom:"40px"} }
                                name="email"
                                type="email"
                                id="email"
                                required
                            />
                        </div>
                        <div>
                            <div style={ {marginBottom:"15px", fontWeight:"700"} }><label htmlFor="password">Mot de passe :</label></div>
                            <ConnexionField
                                name="password"
                                type="password"
                                id="password"
                                required
                            />
                        </div>
                        <p style={ {textDecoration:"underline", color:"#565656", marginBottom:"50px"} }>Mot de passe oublié</p>
                        <MainButton onClick={askConnect}>Je me connecte</MainButton>
                    </form>
                    <div style={ {marginTop:"80px", backgroundColor:"#FFFFFF", padding:"30px"} }>
                        <p style={ {fontWeight:700, marginBottom:"30px"} }>Vous n'avez pas encore de compte ?</p>
                        <LinkForSecondaryButton to="/inscription">Je m'inscris</LinkForSecondaryButton>
                    </div>
                </ConnexionWrapper>}
        </div>
    )
}

export default Connexion