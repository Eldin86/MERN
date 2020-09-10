//komponenta u kojoj imamo sve lokacije usera i na osnovu id usera saljemo tu lokaciju kao objekat u PlaceList komponentu
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import PlaceList from '../components/PlaceList'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import { useHttpClient } from '../../shared/hooks/http-hook'

const UserPlaces = props => {
    const [loadedPlaces, setLoadedPlaces] = useState()
    const { isLoading, error, sendRequest, clearError } = useHttpClient()
    //Dohvacamo dinamiki dio url-a
    const userId = useParams().userId


    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const responseData = await sendRequest(
                    `http://localhost:5000/api/places/user/${userId}`
                )
                setLoadedPlaces(responseData.places)
            } catch (error) {

            }
        }
        fetchPlaces()
    }, [sendRequest, userId])

    //handler koji updatuje places i rendera ih ponovo nakon sto pobrisemo place
    const placeDeletedHandler = (deletedPlaceId) => {
        setLoadedPlaces(prevPlaces => prevPlaces.filter( places => places.id !== deletedPlaceId))
    }

    return (
        <>
        <ErrorModal error={error} onClear={clearError}/>
        {isLoading && (
            <div className="center">
                <LoadingSpinner />
            </div>
        )}
            {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler}/>}
        </>
    )
}

export default UserPlaces