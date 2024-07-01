import styled from 'styled-components'

import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'

import profilePicture from '../../assets/profile-picture-big.png'
import { MainButton, SecondaryButton, LinkForMainButton, InteractionFalseLink, Loader } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { formatDate, formatStringDate, fetchData } from '../../utils/tools'
import { ActiveConversationContext } from '../../utils/context'

import ProfileNav from '../../components/ProfileNav'
import PageTitle from '../../components/PageTitle'


import Connexion from '../Connexion'




const ProfileWrapper = styled.div`
    width: 100%;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    padding-bottom: 150px;
`
const ProfileMain = styled.section`
    width: 100%;
    text-align: center;
    box-sizing: border-box;
    padding-top: 60px;
`

const ContactsNav = styled.div`
display: flex;
flex-wrap: wrap;
justify-content: space-around;
width: 100%;
max-width: 400px;
margin: 0 auto;
`

const ContactsNavItem = styled.p`
  padding: 0 20px;
  font-size:1.2em;
  color:#c90526;
  font-weight: 700;
  text-decoration:underline;
  cursor:pointer;
  &:hover{
    text-decoration:none;
  }

`

const ContactsContainer = styled.div`
  width: 90%;
  margin: 0 auto 60px;
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  @media (min-width:992px){
    width:80%;
  }
`

const ItemWrapper = styled.div`
  box-sizing: border-box;
  width:calc(100% - 30px);
  margin: 15px;
  margin-bottom: 30px;
  background-color: #ffffff;
  padding: 30px;
  cursor: pointer;
  transition: 300ms;
  text-align:center;
  text-decoration: none;
  color: #000000;
  &:hover{
    background-color: #d6d6d6;
  }
  @media (min-width:992px){
    width: calc(33% - 30px);
  }
`

const ContactPhoto = styled.img`
  height:100px;
  width:100px;
  border-radius:50px;
`

const ContactName = styled.p`
  font-size:1.2em;
  font-weight:700;
  margin-bottom:30px;
`



function Contacts () {
    const { token, setToken } = useToken()
    
    const [contactsList, setContactsList] = useState([])
    const [waitingList, setWaitingList] = useState([])
    const [isDataLoading, setDataLoading] = useState(false)
    const [error, setError] = useState(null)
    const [askingDeleteContact, setAskingDeleteContact] = useState("")
    const [deletedContact, setDeletedContact] = useState(false)
    const [displayContacts, setDisplayContacts] = useState("contacts")

    const { setActiveConversation } = useContext(ActiveConversationContext)


    useEffect(() => {
        fetchContacts()
        fetchWaitingContacts()
    }, [token, deletedContact])


    if(!token){
        return <Connexion/>
    }


    async function fetchContacts() {
        setDataLoading(true)
        

        try {
            const res = await fetchData(`/api/contact/get_contacts`, {}, "identified")
        
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

                let contactsToModify = [...result.data]

                if (result.data.length > 0){
                    contactsToModify.forEach((contact) => {
                        contact.acceptation_date = formatStringDate(contact.acceptation_date)
                    })
                }
    
                setContactsList([...contactsToModify])
                setDeletedContact(false)
        }

        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
        finally{
          setDataLoading(false)
        }
    }


    async function fetchWaitingContacts() {
        setDataLoading(true)
        
        try {
            const res = await fetchData(`/api/contact/get_contacts_waiting`, {}, "identified")
        
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
    
                setWaitingList(result.data)
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
        finally{
          setDataLoading(false)
        }
    }


    async function deleteContact(contactPseudo) {

        const contactData = {
            pseudo: contactPseudo 
        }
   
        try {
            const res = await fetchData(`/api/contact/delete`, contactData, "identified")
        
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

            setAskingDeleteContact("")
            setDeletedContact(true)
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }

    }


    async function validateContact(contactPseudo) {

        const currentDate = new Date()
        const currentDateFormatted = formatDate(currentDate)

        const contactData = {
            pseudo: contactPseudo ,
            acceptationDate: currentDateFormatted
        }
   
        try {
            const res = await fetchData(`/api/contact/update`, contactData, "identified")
        
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

            fetchContacts()
            fetchWaitingContacts()
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }

    }



    if (error){
        return(
            <ProfileWrapper style={{display:"block", textAlign:"center"}}>
                <PageTitle title="Cubasics - Erreur de chargement" />
                <p style={ {textAlign:"center", fontSize:"1.6em", margin:"100px auto 60px"} }>Il y a eu un problème</p>
                <p style={{ textAlign:"center" }}><LinkForMainButton to="/">Retourner en page d'accueil</LinkForMainButton></p>
            </ProfileWrapper>
        )
    }

    return(
        <ProfileWrapper>
            <PageTitle title="Cubasics - Vos contacts sur le forum" />
            <ProfileNav />
            <ProfileMain>
                <ContactsNav>
                    <ContactsNavItem onClick={() => setDisplayContacts("contacts")}>Mes contacts</ContactsNavItem>
                    <ContactsNavItem onClick={() => setDisplayContacts("waiting")}>Demandes reçues</ContactsNavItem>
                </ContactsNav>
                {displayContacts === "contacts" ?
                    <section style={ {marginBottom:"100px"} }>
                        <h1 style={{ fontSize:"2em", marginBottom:"40px" }}>Vos contacts</h1>
                        {isDataLoading ?
                            <Loader/>
                        : (<div>
                            { contactsList?.length > 0 ?    
                                <ContactsContainer>
                                    {contactsList.map(({id, pseudo, acceptation_date, photo}) => 
                                        <ItemWrapper key={id}>
                                            <Link to={`/profile/${pseudo}`}>
                                                {photo ? <ContactPhoto src={`${photo}`} alt={`${pseudo}`}/> :
                                                <ContactPhoto src={profilePicture} alt="" />}
                                                <ContactName>{pseudo}</ContactName>
                                            </Link>
                                            <div style={{marginBottom:"30px"}}><LinkForMainButton to="/messages" style={{fontSize:"0.8em"}} onClick={() => setActiveConversation(pseudo)}>Envoyer un message</LinkForMainButton></div>
                                            <InteractionFalseLink onClick={() => setAskingDeleteContact(pseudo)}>Supprimer le contact</InteractionFalseLink>
                                        </ItemWrapper>
                                    )}
                                </ContactsContainer>
                            :
                                <div>
                                    <p style={{marginBottom:"30px"}}>Vous n'avez pas encore de contacts</p>
                                </div>
                            }
                        </div>)}
                    </section> :
                    <section style={ {marginBottom:"100px"} }>
                    <h1 style={{ fontSize:"2em", marginBottom:"40px" }}>Demandes de contact reçues</h1>
                    {isDataLoading ?
                        <Loader/>
                    : (<div>
                        { waitingList?.length > 0 ?    
                            <ContactsContainer>
                                {waitingList.map(({id, pseudo, photo}) => 
                                    <ItemWrapper key={id}>
                                        <Link to={`/profile/${pseudo}`}>
                                            {photo ? <ContactPhoto src={`${photo}`} alt={`${pseudo}`}/> :
                                            <ContactPhoto src={profilePicture} alt="" />}
                                            <ContactName>{pseudo}</ContactName>
                                        </Link>
                                        <div style={{marginBottom:"30px"}}><MainButton onClick={() => validateContact(pseudo)}>Accepter la demande</MainButton></div>
                                        <InteractionFalseLink onClick={() => deleteContact(pseudo)}>Refuser la demande</InteractionFalseLink>
                                    </ItemWrapper>
                                )}
                            </ContactsContainer>
                        :
                            <div>
                                <p style={{marginBottom:"30px"}}>Vous n'avez pas reçu de nouvelle demande de contact</p>
                            </div>
                        }
                    </div>)}
                </section>}
                {askingDeleteContact && <div style={{position:"fixed", width:"100vw", height:"100vh", backgroundColor:"rgba(150,150,150,0.8)", top:0, left:0}}>
                    <div style={{margin:"60px auto 0", padding:"40px 30px", boxSizing:"border-box", width:"90%", maxWidth:"800px", backgroundColor:"#ffffff"}}>
                        <h2>Attention, vous vous apprêtez à supprimer {askingDeleteContact} de vos contacts !</h2>
                        <p>Êtes-vous sûr de vouloir le supprimer ?</p>
                        <MainButton onClick={() => deleteContact(askingDeleteContact)}style={{margin:"15px"}}>Oui, je souhaite supprimer ce contact</MainButton>
                        <SecondaryButton onClick={() => setAskingDeleteContact("")} style={{margin:"15px"}}>Non, j'ai changé d'avis</SecondaryButton>
                    </div>
                </div>}
            </ProfileMain>
        </ProfileWrapper>
    )
}

export default Contacts