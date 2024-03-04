import styled, { keyframes } from 'styled-components'
//import { Link } from 'react-router-dom'
import { HashLink as Link } from 'react-router-hash-link'



const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`

export const Loader = styled.div`
  padding: 10px;
  border: 6px solid #c90526;
  border-bottom-color: transparent;
  border-radius: 22px;
  animation: ${rotate} 1s infinite linear;
  height: 0;
  width: 0;
  margin:0 auto;
`


export const MainButton = styled.button`
  background-color:#c90526;
  color:#ffffff;
  border:none;
  text-transform:uppercase;
  cursor:pointer;
  padding:10px 20px;
  font-weight:700;
  transition:300ms;
  &:hover{
    background-color:#af021f;
  }
`

export const SecondaryButton = styled.button`
  padding:5px 10px;
  background-color:#d6d6d6;
  border:none;
  cursor:pointer;
  transition:300ms;
  text-align:center;
  color:#000000;
  &:hover {
    background-color:#565656;
    color:#ffffff;
  }
  ${props => `
    .${props.className}active-filter {
      background-color:#565656;
      color:#ffffff;
    }
  `}
`

export const LinkForMainButton = styled(Link)`
  background-color:#c90526;
  color:#ffffff;
  border:none;
  text-transform:uppercase;
  cursor:pointer;
  padding:10px 20px;
  font-weight:700;
  transition:300ms;
  text-decoration:none;
  &:hover{
    background-color:#af021f;
  }
`

export const LinkForSecondaryButton = styled(Link)`
  padding:10px;
  background-color:#d6d6d6;
  color:#000000;
  border:none;
  cursor:pointer;
  transition:300ms;
  text-align:center;
  text-decoration:none;
  &:hover {
    background-color:#565656;
    color:#ffffff;
  }
`

export const InteractionFalseLink = styled.p`
  text-decoration:underline;
  color:#929292;
  cursor:pointer;
  font-size:0.8em;
  &:hover{
    text-decoration:none;
  }
`
export const InteractionLink = styled(Link)`
  text-decoration:underline;
  color:#929292;
  cursor:pointer;
  font-size:0.8em;
  &:hover{
    text-decoration:none;
  }
`