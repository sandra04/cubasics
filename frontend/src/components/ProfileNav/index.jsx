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