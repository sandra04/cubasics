import { createContext } from 'react'
import { useState } from 'react'


// On initialise le contexte
export const UserStatusContext = createContext()

// On crée le Provider lié à notre contexte (il wrappera le plus haut composant parent des Composants qui ont besoin d'accéder aux données gérées ici)
// Il permet de gérer le state qui sera partagé aux enfants qui "se branchent" sur le contexte "UserStatusContext"
export const UserStatusProvider = ({ children }) => {
    const tk = localStorage.getItem('token')
    const [token, setToken] = useState(tk ? tk : "")

    return (
        <UserStatusContext.Provider value={{ token, setToken }}>
            {children}
        </UserStatusContext.Provider>
    )
}