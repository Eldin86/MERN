import React, { useEffect, useState, useContext } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import Input from '../../shared/components/FormElements/Input'
import Button from '../../shared/components/FormElements/Button'
import Card from '../../shared/components/UIElements/Card'
import {
    VALIDATOR_REQUIRE,
    VALIDATOR_MINLENGTH
} from '../../shared/util/validators'
import { useForm } from '../../shared/hooks/form-hook'
import { useHttpClient } from '../../shared/hooks/http-hook'
import './PlaceForm.css'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import {AuthContext} from '../../shared/context/auth-context'

const UpdatePlace = props => {
    const auth = useContext(AuthContext)
    const history = useHistory()
    const { isLoading, error, sendRequest, clearError } = useHttpClient()
    const [loadedPlace, setLoadedPlace] = useState()
    //dohvatimo dinamiki dio iz url-a, odnosno id
    const placeId = useParams().placeId
    //vratimo objekat koji ima isti id i proslijedimo informacije u input polja
    //The filter() method creates an array filled with all array elements that pass a test (provided as a function).
    //The find() method returns the value of the first element in an array that pass a test

    const [formState, inputHandler, setFormData] = useForm({
        title: {
            value: '',
            isValid: false
        },
        description: {
            value: '',
            isValid: false
        }
    }, false)

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const responseData = await sendRequest(
                    `http://localhost:5000/api/places/${placeId}`
                )
                setLoadedPlace(responseData.place)
                setFormData({
                    title: {
                        value: responseData.place.title,
                        isValid: true
                    },
                    description: {
                        value: responseData.place.description,
                        isValid: true
                    }
                }, true)
                //ne treba nam catch block jer imamo build in u useHttpClient hook
            } catch (error) {

            }
        }
        fetchPlace()
    }, [sendRequest, placeId, setFormData])


    const placeUpdateSubmitHanlder = async event => {
        event.preventDefault()
        try {
            await sendRequest(
                `http://localhost:5000/api/places/${placeId}`,
                'PATCH',
                JSON.stringify({
                    title: formState.inputs.title.value,
                    description: formState.inputs.description.value
                }),
                {
                    'Content-Type': 'application/json',
                    //dodamo token u headers request
                    Authorization: 'Bearer ' + auth.token
                }
            )
            history.push(`/${auth.userId}/places`)
        } catch (error) {

        }
    }


    if (isLoading) {
        return (
            <div className="center"><LoadingSpinner /></div>
        )
    }

    if (!loadedPlace && !error) {
        return <div className="center">
            <Card><h2>Could not find Place</h2></Card>
        </div>
    }

    return (
        <>
            <ErrorModal error={error} onClear={clearError} />
            {!isLoading && loadedPlace && <form className="place-form" onSubmit={placeUpdateSubmitHanlder}>
                <Input
                    id="title"
                    element="input"
                    type="text"
                    label="Title"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a valid title"
                    onInput={inputHandler}
                    initialValue={loadedPlace.title}
                    initialIsValid={true} />

                <Input
                    id="description"
                    element="textarea"
                    label="Description"
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText="Please enter a valid description (min. 5 characters)"
                    onInput={inputHandler}
                    initialValue={loadedPlace.description}
                    initialIsValid={true} />

                <Button type="submit" disabled={!formState.isValid}>UPDATE PLACE</Button>
            </form>}
        </>
    )
}

export default UpdatePlace