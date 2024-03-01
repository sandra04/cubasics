import styled from 'styled-components'
import { Link } from 'react-router-dom'


const ProfileNavWrapper = styled.nav` 
    width: 100%;
    box-sizing:border-box;
    line-height: 2.7em;
    padding: 20px;
    background-color:#ffffff;
    border-bottom:2px solid #d6d6d6;
`

const NavContainer = styled.ul`
    width:100%;
    display:flex;
    flex-wrap:wrap;
    justify-content:space-around;
    list-style:none;
    padding:0;
    margin:0;
`

const NavItem = styled.li`
    padding:0 10px;
`

const NavLink = styled(Link)`
    &:hover{
        text-decoration:none;
    }
`

/* Menu vertical
const ProfileNav = styled.nav` 
    width: 100%;
    box-sizing:border-box;
    line-height: 2.7em;
    padding: 40px 15px;
    background-color:#ffffff;
    border-bottom:2px solid #d6d6d6;
    @media (min-width:1024px){
        max-width: 380px;
        height: 100vw;
        border-right:2px solid #d6d6d6;
    }
`

const NavContainer = styled.ul`
    width:calc(100% - 60px);
    display:flex;
    flex-wrap:wrap;
    list-style:none;
    @media (min-width:1024px){
        display:block;
    }
`

const NavLink = styled.li`
    padding-right:70px;
    cursor: pointer;
    text-decoration: underline;
    
    &:hover{
        text-decoration:none;
    }
    @media (min-width:1024px){
        padding-right:0;
    }
`
*/


function ProfileNav () {
    return(
        <ProfileNavWrapper>
            <NavContainer>
                <NavItem><NavLink to="/user_posts">Mes posts</NavLink></NavItem>
                <NavItem><NavLink to="/user_projects">Mes projets</NavLink></NavItem>
                <NavItem><NavLink to="/user_favorites">Mes favoris</NavLink></NavItem>
                <NavItem><NavLink to="/user_comments">Les posts que j'ai commentés</NavLink></NavItem>
                <NavItem><NavLink to="/contacts">Mes contacts</NavLink></NavItem>
                <NavItem><NavLink to="/messages">Mes messages</NavLink></NavItem>
            </NavContainer>
        </ProfileNavWrapper>
    )
}


export default ProfileNav