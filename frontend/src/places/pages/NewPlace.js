//ADD NEW PLACE which contain form with inputs for adding iformations
import React, {useContext} from 'react'
import {useHistory} from 'react-router-dom'

import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from '../../shared/util/validators'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import Input from '../../shared/components/FormElements/Input'
import Button from '../../shared/components/FormElements/Button'
import { useForm } from '../../shared/hooks/form-hook'
import {useHttpClient} from '../../shared/hooks/http-hook'
import {AuthContext } from '../../shared/context/auth-context'
import ImageUpload from '../../shared/components/FormElements/ImageUpload'
import './PlaceForm.css'


const NewPlace = () => {
    const auth = useContext(AuthContext)
    const {isLoading, error, sendRequest, clearError} = useHttpClient()

    const [formState, inputHandler] = useForm({
        title: {
            value: '',
            isValid: false
        }, 
        description: {
            value: '',
            isValid: false
        }, 
        address: {
            value: '',
            isValid: false
        },
        image: {
            value: null,
            isValid: false
        }
        //false je inicijalna vrijednost koju proslijedimo kao argument u useForm hook
    }, false)
    const history = useHistory()

    const placeSubmitHandler = async event => {
        event.preventDefault()
        const formData = new FormData()
        formData.append('title', formState.inputs.title.value)
        formData.append('description', formState.inputs.description.value)
        formData.append('address', formState.inputs.address.value)
        formData.append('image', formState.inputs.image.value)

        //kad submitamo place zelimo poslati request, posto je asinhroni poskupak stavimo ga u try/catch
        try{
            await sendRequest(
                'http://localhost:5000/api/places',
                'POST',
                //posaljemo objekat koji treba imati propertije ove
                formData,
                //Dodajemo authorization headers za request
                {Authorization: 'Bearer ' + auth.token}
            )
            //Redirect user to a different page after add new place
            history.push('/')
        }catch(error){

        }
    }


    return (
        <>
        <ErrorModal error={error} onClear={clearError}/>
        <form className="place-form" onSubmit={placeSubmitHandler}>
            {isLoading && <LoadingSpinner asOverlay/>}
            <Input
                id="title"
                type="text"
                label="Title"
                element="input"
                //vraceni objekat koji sadrzi tip validatora (i vrijednost koju proslijedimo) 
                validators={[VALIDATOR_REQUIRE()]}
                onInput={inputHandler}
                errorText="Please enter a valid title" />

            <Input
                id="description"
                label="Description"
                element="textarea"
                validators={[VALIDATOR_MINLENGTH(5)]}
                onInput={inputHandler}
                errorText="Please enter a valid description (at least 5 characters)" />

            <Input
                id="address"
                label="Address"
                element="input"
                validators={[VALIDATOR_REQUIRE()]}
                onInput={inputHandler}
                errorText="Please enter a valid address" />
                <ImageUpload id="image" onInput={inputHandler} errorText="Please provide an image"/>
            <Button type="submit" disabled={!formState.isValid}>ADD PLACE</Button>
        </form>
    </>
    )
}

export default NewPlace