import { useContext } from 'react'
import { UserStatusContext } from '../../utils/context'



export function useToken(){
    const { token, setToken } = useContext(UserStatusContext)
    return { token, setToken }
}