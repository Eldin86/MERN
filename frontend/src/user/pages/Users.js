//komponenta koja dohvaca usere koji su objekat sa id, image, name i places vrijednostima, i proslijedimo ih u UsersList komponentu
import React, { useEffect, useState } from 'react'

import UsersList from '../components/UsersList'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import {useHttpClient} from '../../shared/hooks/http-hook'

const Users = () => {
    const {isLoading, error, sendRequest, clearError} = useHttpClient()
    const [loadedUsers, setLoadedUsers] = useState()

    useEffect(() => {
        //definisemo novu funkciju unutar useEffect jer ne smijemo na callback funkciju unutar useEffect koristiti async
        const fetchUsers = async () => {
            try {
                //ne moramo dodavati Content-Type jer ne attachiramo nikakve podatke
                const responseData = await sendRequest('http://localhost:5000/api/users')
                
                setLoadedUsers(responseData.users)
            } catch (error) {
                
            }
        }
        fetchUsers()
    }, [sendRequest])

    return (
        <>
        <ErrorModal error={error} onClear={clearError}/>
        {isLoading && (
             <div className="center">
                 <LoadingSpinner />
             </div>
        )}
        {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
        </>
    )
}
export default Users