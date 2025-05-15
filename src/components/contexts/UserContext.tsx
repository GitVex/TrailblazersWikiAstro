import {createContext} from 'preact'
import {useContext, useState} from 'preact/hooks'
import type {User} from '../types'

interface UserContextState {
    user: User | null
    setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextState | undefined>(undefined)

const UserProvider = ({children}: { children: preact.JSX.Element }) => {
    const [user, setUser] = useState<User | null>(null)

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

export default UserProvider
