"use client"
import {createContext, useEffect, useContext, useState} from 'react';

const inicialState = {
        username: '',
        isAutenticated: false
};
const UserContext: any = createContext(inicialState);

const UserProvider = ({children}: {
    children: React.ReactNode
}) => {
    const [user, setUser] = useState(inicialState)
    useEffect(() => {
        let user: any = window.localStorage.getItem('user');
        user=JSON.parse(String(user));
       setUser(user);
    }, []);
    return (
        <UserContext.Provider value={{user, setUser}}>{children}</UserContext.Provider>
    );
}
const useUserContext=(): any => {
    return useContext(UserContext);
}
export {useUserContext, UserProvider};
