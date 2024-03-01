import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import userIcon from '../../assets/user-icon.png'
import message from '../../assets/message.png'

import { useToken } from '../../utils/hooks'

const HeaderWrapper = styled.nav`
  width:100%;
  margin: 0;
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
`
const HeaderLogo = styled.div`
    text-transform:uppercase;
    font-size:2.6em;
    font-weight:700;
    color:#c90526;
    text-decoration:none;
    text-align:center;
    padding-top:30px;
    margin-bottom:30px;
    @media (max-width:538px){
      margin-top:40px;
    }

`
const UserIconsWrapper = styled.div`
  position:absolute;
  right:0;
`

const UserIcon = styled.img`
  width:32px;
  height:32px;
  padding:15px;
  cursor:pointer;
`
const UserActions = styled.div`
  position:absolute;
  top:60px;
  right:15px;
  background-color:#ffffff;
  padding:30px;
`

const NavContainer = styled.div`
  width:100%;
  height:60px;
  display: flex;
  flex-wrap:wrap;
  justify-content: space-between;
  align-items: center;
  background-color:#565656;
  padding:0 15%;
  text-align:center;
  font-size:1.2em;
  @media (max-width:538px){
    justify-content:space-around;
    padding:0;
  }
`
const LinkContainer = styled.div`
  height:100%;
  display:flex;
  align-items:center;
  cursor:pointer;
  transition:300ms;
  &:hover{
    background-color:#c90526;
  }
`

const StyledLink = styled(Link)`
  text-decoration: none;
  color:#ffffff;
  font-weight:700;
  padding:40px 20px 0 20px;
  height:100%;
  text-transform:uppercase;
  @media (max-width:538px){
    padding:0;
    margin-top:40px;
  }
`

function Header() {
  const { token, setToken } = useToken()
  const [displayUserActions, setDisplayUserActions] = useState(false)
  const [isDataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState(null)
  const [messagesUnseen, setMessagesUnseen] = useState(0)


  function handleDisplay(){
    setDisplayUserActions(true)
    setTimeout(() => {
      setDisplayUserActions(false)
    }, 1800);
  }

  function logout(){
    localStorage.removeItem('token')
    setToken("")
  }

  useEffect(() => {
    if (token){
      fetchUnseenMessages()
    }
  }, [token]);

  async function fetchUnseenMessages() {
    setDataLoading(true)
    
    try {
      const res = await fetch("http://localhost:3000/api/message/get_unseen", {
          method: "post",
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body:JSON.stringify({})
      });
  
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
          "Content-Length": res.headers.get("Content-Length")
        },
        data: data
      }

      if (result.data.length > 0){
        setMessagesUnseen(result.data[0].notSeen)
      }
      else{
        setMessagesUnseen(0)
      }
    }

    // Network error
    catch(err){
        console.log(err)
        setError(true)
    }
    finally{
      setDataLoading(false)
    }
  }

  return (
      <HeaderWrapper>
          <Link to="/" style={ {textDecoration: "none"} }>
              <HeaderLogo>Cubasics</HeaderLogo>
          </Link>
          <UserIconsWrapper>
            {token && <Link to="/Messages"><UserIcon src={message} alt="Messages"/>{/*messagesUnseen && <span>messagesUnseen</span>*/}</Link> }
            <UserIcon src={userIcon} alt="Login" onClick={() => handleDisplay()}/>
          </UserIconsWrapper>
          {token && displayUserActions &&
            <UserActions>
              <Link to={`/profile`}>Mon profil</Link>
              <p style={{ textDecoration:"underline", color:"#000000", cursor:"pointer" }} onClick={logout}>Se déconnecter</p>
            </UserActions>
          }
          {!token && displayUserActions &&
            <UserActions>
              <p><Link to="/connexion">Se connecter</Link></p>
              <p><Link to="/inscription">Créer un compte</Link></p>
            </UserActions>
          }
          <NavContainer>
            <LinkContainer><StyledLink to="/">Accueil</StyledLink></LinkContainer>
            <LinkContainer><StyledLink to="/posts">Conversations</StyledLink></LinkContainer>
            <LinkContainer><StyledLink to="/projets" style={ {textDecoration: "none"} }>Projets</StyledLink></LinkContainer>
          </NavContainer>
      </HeaderWrapper>
  )
}

export default Header