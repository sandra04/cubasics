import styled from 'styled-components'

import { useState, useEffect, useRef, useContext } from 'react'

import messageIcon from '../../assets/message.png'
import { MainButton, SecondaryButton, LinkForMainButton, Loader } from '../../utils/styles/Atoms'

import { useToken } from '../../utils/hooks'
import { formatDate, formatStringDate, fetchData } from '../../utils/tools'
import { ActiveConversationContext } from '../../utils/context'

import ProfileNav from '../../components/ProfileNav'
import Message from '../../components/Message'
import FormModifyMessage from '../../components/FormModifyMessage'
import PageTitle from '../../components/PageTitle'

import Connexion from '../Connexion'



const ProfileWrapper = styled.div`
    width:100%;
    margin:0;
    display:flex;
    flex-wrap:wrap;
`

const ContactsList = styled.section` 
    width: 100%;
    height:100%;
    box-sizing:border-box;
    background-color:#ffffff;
    border-bottom:2px solid #d6d6d6;
    text-align:center;
    @media (min-width:1024px){
        max-width: 380px;
        border-right:1px solid #d6d6d6;
    }
`
/* padding: 0 15px; */

const ContactItem = styled.div`
    width:100%;
    padding:30px 0;
    text-align:left;
    border-bottom:1px solid #d6d6d6;
    cursor:pointer;
    transition:400ms;
    &:hover{
        background-color:#d6d6d6;
    }
`

const ContactPresentation = styled.div`
    display:flex;
    flex-wrap:wrap;
    align-items:center;
`

const ProfileMain = styled.section`
    width: 100%;
    text-align:center;
    box-sizing: border-box;
    padding:60px 5% 0;
    @media (min-width:1024px){
        width: calc(100% - 380px);
    }
`

const MessagesContainer = styled.div`
  width:90%;
  margin:0 auto;
  display:flex;
  flex-wrap:wrap;
  justify-content:space-between;
`

const ItemWrapper = styled.div`
  width:calc(100% - 60px);
  text-align:left;
`
const AnswerWrapper = styled.section`
    background-color:#d6d6d6;
    padding:60px 30px;
    margin-top:50px;
    margin-bottom:100px;
`
const AnswerField = styled.textarea`
    width:90%;
    margin:0 auto 40px;
`

const ContactsAvailableContainer = styled.div`
  width: 90%;
  margin: 0 auto 60px;
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  @media (min-width:992px){
    width:80%;
  }
`

const ContactAvailable = styled.div`
  box-sizing: border-box;
  width:calc(100% - 30px);
  margin: 15px;
  margin-bottom: 30px;
  background-color: #ffffff;
  padding: 20px;
  cursor: pointer;
  transition: 300ms;
  text-align:center;
  text-decoration: none;
  color: #000000;
  &:hover{
    background-color: #d6d6d6;
  }
  @media (min-width:1366px){
    width: calc(33% - 30px);
  }
`

const ContactName = styled.p`
  font-size:1.2em;
  font-weight:700;
`



function Messages () {
    const { token, setToken } = useToken()
    
    const [conversationsList, setConversationsList] = useState([])
    const [messagesList, setMessagesList] = useState([])
    // Current conversation
    const { activeConversation, setActiveConversation } = useContext(ActiveConversationContext)
    const [inputValue, setInputValue] = useState('')
    const [conversationsLoading, setConversationsLoading] = useState(false)
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [error, setError] = useState(null)
    const [askingDeleteMessage, setAskingDeleteMessage] = useState("")
    const [messageToDelete, setMessageToDelete] = useState(null)
    const [modifyingMessage, setModifyingMessage] = useState(false)
    const [messageToModify, setMessageToModify] = useState({})
    const [newConversation, setNewConversation] = useState(false)
    const [contactsLoading, setContactsLoading] = useState(false)
    const [contactsAvailable, setContactsAvailable] = useState([])
    // Selected to create new conversation
    const [selectedContact, setSelectedContact] = useState("")
    const [messageSent, setMessageSent] = useState(false)

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messagesList]);


    function selectConversation(selectedConversation){
        conversationsList.forEach((conversation) => {
            if (conversation.pseudo === selectedConversation) {
                conversation.isActive = true
            }
            else{
                conversation.isActive = false
            }
        })
        setActiveConversation(selectedConversation)
        setNewConversation(false)
    }

    
    useEffect(() => {
        fetchConversations()
        setMessageSent(false)
    }, [token, askingDeleteMessage, modifyingMessage, selectedContact, messageSent, activeConversation])


    if(!token){
        return <Connexion/>
    }


    async function fetchConversations() {
        setConversationsLoading(true)
        

        try {
            const res = await fetchData(`/api/message/get_conversations`, {}, "identified")
            
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

            let conversationsToModify = [...result.data]

            if (result.data.length > 0){
                conversationsToModify.forEach((conversation) => {
                    conversation.creation_date = formatStringDate(conversation.creation_date)
                    if (activeConversation){
                        if (conversation.pseudo === activeConversation) {
                            conversation.isActive = true
                        }
                        else{
                            conversation.isActive = false
                        }
                    }
                })
            }
            
            setConversationsList([...conversationsToModify])
            
            if (activeConversation){
                fetchMessages(activeConversation)
            }
            else{
                if (conversationsToModify.lenght > 0) {
                    fetchMessages(conversationsToModify[0].pseudo)
                }
            }
        }

        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
        finally{
          setConversationsLoading(false)
        }
    }


    async function fetchMessages(contactPseudo) {
        setMessagesLoading(true)
        
        const contactData = {
            pseudo: contactPseudo
        }

        try {
            const res = await fetchData(`/api/message/get_messages_from_contact`, contactData, "identified")
        
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

            let messagesToModify = [...result.data]
            if (result.data.length > 0){
                messagesToModify.forEach((message) => {
                    message.creation_date = formatStringDate(message.creation_date)
                    if (message.modification_date) {
                        message.modification_date = formatStringDate(message.modification_date)
                    }
                })
            }
            setMessagesList([...messagesToModify])
            updateMessageSeen(contactPseudo)
        }

        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
        finally{
          setMessagesLoading(false)
        }
    }


    async function sendMessage(pseudo){
       
        const currentDate = new Date()

        const currentDateFormatted = formatDate(currentDate)

        let messageData;

        messageData = {
            pseudo:pseudo,
            content: inputValue,
            creationDate: currentDateFormatted,
            image: null
        }
          
        try {
            const res = await fetchData(`/api/message/new_message`, messageData, "identified")
        
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
            setInputValue("")
            setSelectedContact("")
            setActiveConversation(pseudo)
            setMessageSent(true)
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }

    function checkMessage(e, pseudo){
        e.preventDefault()
        sendMessage(pseudo)
    }
    
    // Modifie la valeur dans le state local à chaque changement de saisie
    function handleInput(e) {
        setInputValue(e.target.value)
	}


    async function updateMessageSeen(contactPseudo){

        const messageData = {
            pseudo: contactPseudo
        }
          
        try {
            const res = await fetchData(`/api/message/modify_seen`, messageData, "identified")
        
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
        }
        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
    }


    async function deleteMessage() {

        if (typeof messageToDelete === 'number'){
            const messageData = {
                id: messageToDelete
            }
        
            try {
                const res = await fetchData(`/api/message/delete`, messageData, "identified")
            
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
                setAskingDeleteMessage(false)
                setMessageToDelete(null)

                if (messagesList.length > 1) {
                    fetchMessages(messagesList[0].user)
                }
                else{
                    setActiveConversation("")
                }

            }
            // Network error
            catch(err){
                if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
                setError(true)
            }

        }
    }

    async function fetchContactsWithNoConversation() {
        setContactsLoading(true)
        
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
            
            let contactsPseudos = {}
            let contactsNoConversation = []

            if (result.data.length > 0){
                conversationsList.forEach((conversation) => {
                    contactsPseudos[conversation.pseudo] = true
                })
                result.data.forEach((contact) => {
                    if (!contactsPseudos[contact.pseudo]) {
                        contactsNoConversation.push(contact)
                    }
                })
            }

            setContactsAvailable(contactsNoConversation)
        }

        // Network error
        catch(err){
            if (process.env.REACT_APP_SHOW_LOGS) { console.log(err) }
            setError(true)
        }
        finally{
          setContactsLoading(false)
        }
    }

    function handleNewConversation(){
        fetchContactsWithNoConversation()
        setNewConversation(true)
        const conversations = document.getElementsByClassName("conversation-item")
        
        Object.values(conversations).forEach((element) => {
            element.classList.remove("active-conversation")
        })
    }

    function selectContactForNewMessage(pseudo){
        setSelectedContact(pseudo)
        setNewConversation(false)
    }


    if (error){
        return(
            <ProfileWrapper style={{display:"block", textAlign:"center"}}>
                <PageTitle title="Cubasics - Erreur de chargement des messages" />
                <p style={ {textAlign:"center", fontSize:"1.6em", margin:"100px auto 60px"} }>Il y a eu un problème</p>
                <p style={{ textAlign:"center" }}><LinkForMainButton to="/">Retourner en page d'accueil</LinkForMainButton></p>
            </ProfileWrapper>
        )
    }

    return(
        <ProfileWrapper>
            <PageTitle title="Cubasics - Votre messagerie privée sur le forum" />
            <ProfileNav />
            {conversationsLoading ? <Loader/> :
            (<ContactsList>
                {conversationsList?.length > 0 &&
                conversationsList.map(({pseudo, creation_date, isLastSender, isActive}, index) =>
                <div key={index}>
                    {isActive ?
                        <ContactItem id={pseudo} className="conversation-item active-conversation" onClick={() => selectConversation(pseudo)}>
                            <ContactPresentation>
                                <img src={messageIcon} alt="" style={ {width:"32px", height:"32px", padding:"0 15px"} } />
                                <p style={ {fontWeight:700, margin:0} }>{pseudo}</p>
                            </ContactPresentation>
                            {isLastSender ?
                                <p style={ {margin:0, padding:"0 15px"} }> Dernier message envoyé le {creation_date}</p> :
                                <p style={ {margin:0, padding:"0 15px"} }> Dernier message reçu le {creation_date}</p>}
                        </ContactItem>:
                    <ContactItem id={pseudo} className="conversation-item" onClick={() => selectConversation(pseudo)}>
                    <ContactPresentation>
                        <img src={messageIcon} alt="" style={ {width:"32px", height:"32px", padding:"0 15px"} } />
                        <p style={ {fontWeight:700, margin:0} }>{pseudo}</p>
                    </ContactPresentation>
                    {isLastSender ?
                        <p style={ {margin:0, padding:"0 15px"} }> Dernier message envoyé le {creation_date}</p> :
                        <p style={ {margin:0, padding:"0 15px"} }> Dernier message reçu le {creation_date}</p>}
                </ContactItem>}
                </div>
                )}
                <MainButton onClick={handleNewConversation} style={{margin:"30px 0"}}>Démarrer une nouvelle conversation</MainButton>
            </ContactsList>)}
            <ProfileMain>
                {newConversation ?
                    <section style={ {marginBottom:"100px"} }>
                        <h1>Qui souhaitez-vous contacter ?</h1>
                        {contactsLoading ? <Loader/> :
                        (<div>
                            { contactsAvailable?.length > 0 ?    
                                <ContactsAvailableContainer>
                                    {contactsAvailable.map(({id, pseudo}) => 
                                        <ContactAvailable key={id} onClick={() => selectContactForNewMessage(pseudo)}>
                                            <ContactName>{pseudo}</ContactName> 
                                        </ContactAvailable>
                                    )}
                                </ContactsAvailableContainer>
                            :
                                <div>
                                    <p style={{marginBottom:"30px"}}>Vous n'avez pas de contact disponible pour une nouvelle conversation</p>
                                </div>
                            }
                        </div>)}
                    </section> :
                    <section style={ {marginBottom:"100px"} }>
                        <div>
                        { selectedContact ?
                            <div>
                                <AnswerWrapper id="answerToPost">
                                    <form onSubmit={e => e.preventDefault()}>
                                        <h2>Envoyer un message à {selectedContact}</h2>
                                        <AnswerField
                                            id="comment"
                                            rows="10"
                                            value={inputValue}
                                            onChange={handleInput}
                                        ></AnswerField>
                                        <div><MainButton onClick={(e) => checkMessage(e, selectedContact)}>Envoyer le message</MainButton></div>
                                    </form>
                                </AnswerWrapper>
                            </div>:
                            <div>
                                {messagesLoading ? <Loader/> :
                                (<div>
                                    { messagesList?.length > 0 ? 
                                        <div>
                                            <header>
                                                <h1 style={{ fontSize:"2em", marginBottom:"80px" }}>Vos échanges avec {messagesList[0].user}</h1>
                                            </header>   
                                            <MessagesContainer>
                                                {messagesList.map(({ id, content, image, creation_date, modification_date, seen, user, isSender }) => 
                                                    <ItemWrapper key={id}>
                                                        <Message
                                                            id={id}
                                                            content={content}
                                                            image={image}
                                                            date={creation_date}
                                                            modifiedDate={modification_date}
                                                            seen={seen}
                                                            user={user}
                                                            isSender={isSender}
                                                            setModifyingMessage={setModifyingMessage} setMessageToModify={setMessageToModify}  setAskingDeleteMessage={setAskingDeleteMessage} setMessageToDelete={setMessageToDelete}
                                                        />
                                                    </ItemWrapper>
                                                )}
                                                <div ref={messagesEndRef} />
                                            </MessagesContainer>
                                            <div>
                                                {modifyingMessage ?
                                            <div id="modifyComment">
                                                    <FormModifyMessage
                                                        id={messageToModify.id}    
                                                        content={messageToModify.content}
                                                        image={messageToModify.image}
                                                        setModifyingMessage={setModifyingMessage}
                                                    />
                                                </div>:
                                                <AnswerWrapper id="answerToPost">
                                                    <form onSubmit={e => e.preventDefault()}>
                                                        <h2>Répondre à {messagesList[0].user}</h2>
                                                        <AnswerField
                                                            id="comment"
                                                            rows="10"
                                                            value={inputValue}
                                                            onChange={handleInput}
                                                        ></AnswerField>
                                                        <div><MainButton onClick={(e) => checkMessage(e, messagesList[0].user)}>Envoyer le message</MainButton></div>
                                                    </form>
                                                </AnswerWrapper>}
                                            </div>
                                            {askingDeleteMessage &&
                                            <div style={{position:"fixed", width:"100vw", height:"100vh", backgroundColor:"rgba(150,150,150,0.8)", top:0, left:0}}>
                                                <div style={{margin:"60px auto 0", padding:"40px 30px", boxSizing:"border-box", width:"90%", maxWidth:"800px", backgroundColor:"#ffffff"}}>
                                                    <h2>Souhaitez-vous vraiment supprimer votre message ?</h2>
                                                    <p>(vous ne pourrez plus revenir en arrière)</p>
                                                    <MainButton onClick={deleteMessage} style={{margin:"15px"}}>Supprimer mon message</MainButton>
                                                    <SecondaryButton onClick={() => setAskingDeleteMessage(false)} style={{margin:"15px"}}>Non, j'ai changé d'avis</SecondaryButton>
                                                </div>
                                            </div>}
                                        </div>:
                                        <div>
                                            <header>
                                                <h1 style={{ fontSize:"2em", marginBottom:"80px" }}>Vos messages</h1>
                                            </header>
                                            <p>Vous n'avez pas encore de messages</p>
                                        </div>
                                    }
                                </div>)}
                            </div>}
                        </div>
                    </section>}
            </ProfileMain>
        </ProfileWrapper>
    )
}

export default Messages