import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import {useAuth} from './shared/hooks/auth-hook'

import Users from './user/pages/Users'
import NewPlace from './places/pages/NewPlace'
import MainNavigation from './shared/components/Navigation/MainNavigation'
import UserPlaces from './places/pages/UserPlaces'
import UpdatePlace from './places/pages/UpdatePlace'
import Auth from './user/pages/Auth'
import { AuthContext } from './shared/context/auth-context'


const App = () => {
  const {token, userId, login, logout} = useAuth()
  let routes;

  //ako imamo token prikazu rute Users, UsersPlaces, NewPlace, UpdatePlace i Redirect
  if (token) {
    routes = (
      <Switch>
        {/* homepage gdje izlistava sve usere koji sadrze places*/}
        < Route exact path="/" >
          <Users />
        </Route >

        {/* places koje nadje po useru */}
        < Route path={`/:userId/places`}>
          <UserPlaces />
        </Route >

        {/* dodavanje novog mjesta */}
        <Route exact path="/places/new">
          <NewPlace />
        </Route>

        {/* updatovanje places */}
        <Route exact path="/places/:placeId">
          <UpdatePlace />
        </Route>

        <Redirect to="/" />
      </Switch>
    )

  }
  //ako nismo logovani prikazi rute Users, UsersPlaces, Auth i Redirect
  else {
    routes = (
      <Switch>
        {/* homepage gdje izlistava sve usere koji sadrze places*/}
        < Route exact path="/" >
          <Users />
        </Route >

        {/* places koje nadje po useru */}
        < Route path={`/:userId/places`}>
          <UserPlaces />
        </Route >

        {/* redirect na auth formu */}
        <Route exact path="/auth">
          <Auth />
        </Route>

        <Redirect to="/auth" />
      </Switch>
    )
  }

  return (
    <AuthContext.Provider value={{
      //vrati true ili false, ako nemamo token vrati false, ako imamo token vrati true, ako imamo token logovani smo
      isLoggedIn: !!token,
      token: token,
      //Posaljemo userId pomocu context-a
      userId: userId,
      //proslijedimo handler login u auth-context.js koji postavlja vrijednost isLoggedIn na true
      login: login,
      //proslijedimo handler logout u auth-context.js koji postavlja vrijednost isLoggedIn na false
      logout: logout
    }}>
      {/* u top level komponenti omotamo sve pages koje trebamo da renderamo pomocu Router-a */}
      <Router>
        <MainNavigation />
        <main>
          {routes}
        </main>
      </Router>
    </AuthContext.Provider>
  )
}

export default App;
