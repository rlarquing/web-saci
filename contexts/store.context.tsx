"use client"
import React, {createContext, useContext, useState} from 'react';

const inicialState: any = {
    messageModel:{},
};
const StoreContext: any = createContext(inicialState);

const StoreContextProvider = ({children}: {
    children: React.ReactNode
}) => {
    const [store, setStore] = useState(inicialState)

    return (
        <StoreContext.Provider value={{store, setStore}}>{children}</StoreContext.Provider>
);
}

const useStoreContext=() => {
    return useContext(StoreContext);
}

export {useStoreContext, StoreContextProvider};