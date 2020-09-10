import {useState, useCallback, useEffect} from 'react'

let logoutTimer

export const useAuth = () => {
      //mjenjamo state klikom na logout button
  const [token, setToken] = useState(false)
  const [tokenExpirationDate, setTokenExpirationDate] = useState()
  const [userId, setUserID] = useState(false)

  //postavljamo isLoggedIn na true, odnosno da smo logovani
  //login hanlder prima userId kao argument Auth.js komponenta
  const login = useCallback((uid, token, expirationDate) => {
    setToken(token)
    //postavimo userId
    setUserID(uid)
    //trenutno vrijeme plus 1 sat je tokenExpirationDate
    //ili imamo postojeci expirationDate jer smo automatski logirali usera zbog localStorate, inace kreiramo novi token
    const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60)
    setTokenExpirationDate(tokenExpirationDate)
    console.log('tokenExpirationDate', tokenExpirationDate)

    //Spremimo token i userId u localStorage
    localStorage.setItem('userData', JSON.stringify({ 
      userId: uid, 
      token: token, 
      //The toISOString() method converts a Date object into a string, using the ISO standard.
      //u localstorage mozemo samo spasiti text ili podatke koji mogu biti pretvoreni u tekst, objekte ne mozemo spremiti, ali sa JSON.stringfy() mozmeo pretvoriti objekat u text, zato koristimo stringify()
      expiration: tokenExpirationDate.toISOString()
    }))
  }, [])
  //postavljamo isLoggedIn na false, odnosno da nismo logovani
  const logout = useCallback(() => {
    setToken(null)
    setTokenExpirationDate(null)
    setUserID(null)
    //ocistimo localStorage kad se logout
    localStorage.removeItem('userData')
  }, [])

  useEffect(() => {
    if(token && tokenExpirationDate){
      //vrijeme koje je ostalo da je token validan
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime()
      //pozivamo setTimeout koji poziva logout hanlder za vrijeme koje je ostalo da token istekne
      logoutTimer = setTimeout(logout, remainingTime)
    }else{
      clearTimeout(logoutTimer)
    }
  }, [token, logout, tokenExpirationDate])

  useEffect(() => {
    console.log('localStorage -> app.js', localStorage.getItem('userData'))
    //konvertovali smo u javascript objekat koji smo spasili kao string u login handleru
    const storedData = JSON.parse(localStorage.getItem('userData'))
    console.log('storedData -> app.js', storedData)
    //provjeravamo da li imamo ista u storedData i da li imamo token u storedData
    //u useEffect trebamo verificirati da li je token istekao ili ne, posto i u useEffect pozivamo login() hanlder
    if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) {
      login(storedData.userId, storedData.token, new Date(storedData.expiration))
    }
  }, [login])

  return {
      token, 
      login,
      logout,
      userId
  }

}