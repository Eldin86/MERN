import {createContext} from 'react'

//postavljamo vrijednosti propertija cisto radi autocompletion??
export const AuthContext = createContext({
    isLoggedIn: false,
    //da mozemo poslati i userID?
    userId: null,
    token: null,
    //login i logout postavimo kao placeholdere, da ocekuje funkciju
    login: () => {},
    logout: () => {}
})