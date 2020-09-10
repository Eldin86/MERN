//
import React, { useState, useContext } from 'react'

import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/util/validators'
import Card from '../../shared/components/UIElements/Card'
import Input from '../../shared/components/FormElements/Input'
import Button from '../../shared/components/FormElements/Button'
import { useForm } from '../../shared/hooks/form-hook'
import { useHttpClient } from '../../shared/hooks/http-hook'
import { AuthContext } from '../../shared/context/auth-context'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import ImageUpload from '../../shared/components/FormElements/ImageUpload'

import './Auth.css'

const Auth = () => {
    //Dohvatimo context
    const auth = useContext(AuthContext)

    const [isLoginMode, setIsLoginMode] = useState(true)
    const { isLoading, error, sendRequest, clearError } = useHttpClient()

    //custom hook koja prima input fields kao objekte sa vrijednostima value i isValid
    //vraca formState objekat, inputHandler i setFormData handlere
    const [formState, inputHandler, setFormData] = useForm({
        email: {
            value: '',
            isValid: false
        },
        password: {
            value: '',
            isValid: false
        }
    }, false)

    /*klikom na handler submitamo formu i  ispisujemo vrijednosti input polja, 
    takodjer se logujemo pozivom auth.login()*/
    const authSubmitHandler = async (event) => {
        event.preventDefault()

        //Ako smo u login modu
        if (isLoginMode) {
            try {
                //dohvatimo backend
                const responseData = await sendRequest(
                    'http://localhost:5000/api/users/login',
                    'POST',
                       //body uvijek mora biti u json formatu
                    //sadrzi samo email i password
                    //Posaljemo na server kao body objekat, tako da na serveru dohvacamo kao req.body.email i req.body.password
                    JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    }),
                    {
                        //sadrzi JSON podatke
                        'Content-Type': 'application/json'
                    }
                )
                console.log('responseData -> Auth.js', responseData)
                //proslijedimo id usera u login handler, posto smo ga dobili iz backenda prilikom logiranja u responseData
                auth.login(responseData.userId, responseData.token)
            } catch (error) {

            }
        } else {
            try {
                //sad ne trebamo slati json sto smo do sad radili, nego drugi tip, sad saljemo FormData
                const formData = new FormData()
                //u form data mozemo poslati i string, name, email, password, a takodjer mozmeo poslate binarne podatke
                formData.append('email', formState.inputs.email.value)
                formData.append('name', formState.inputs.name.value)
                formData.append('password', formState.inputs.password.value)
                //image je key koji smo vec definisali u backendu -> fileUpload.single('image'), zbog image koristimo formData
                formData.append('image', formState.inputs.image.value)
                //ako smo u signup modu
                //dohvatimo backend
                //fetch api koji koristimo underHook da posaljemo request automatski dodaje one headers koji trebaju
                const responseData = await sendRequest(
                    'http://localhost:5000/api/users/signup',
                    'POST',
                    formData
                )
                //proslijedimo id usera u login handler, posto smo ga dobili iz backenda prilikom kreiranja accounta
                auth.login(responseData.userId, responseData.token)
            } catch (error) {

            }
        }
    }


    /* Switchamo button 'SIGNUP' i 'LOGIN' */
    const switchModeHandler = () => {
        //Ako je !isLoginMode postavimo name na undefined 
        //1. Login mode
        if (!isLoginMode) {
            //pozovemo setFormData u koju proslijedimo inputs i da li je forma validna true ili false
            setFormData({
                //kopiramo inputs objekte, i postavimo name property kao undefined
                ...formState.inputs,
                //postavimo name undefined jer ne treba da imamo prilikom logovanja name input vrijednost
                name: undefined,
                image: undefined,
                //Ako su email i password validni vrti cijelu formu kao true
            }, formState.inputs.email.isValid && formState.inputs.password.isValid)
        } else {
            //2. Signup mode
            console.log('Auth.js -> isLogginMode', isLoginMode)
            setFormData({
                //Kopiramo sve inputs vrijednosti i dodamo name vrijednost jer nam treba za registraciju
                ...formState.inputs,
                name: {
                    value: '',
                    isValid: false
                },
                image: {
                    value: null,
                    isValid: false
                }
            }, false)
        }
        //klikom na switchModeHandler togglamo i isLoginMode
        setIsLoginMode(prevMode => !prevMode)
    }

    return (
        <>
            <ErrorModal error={error} onClear={clearError} />
            <Card className="authentication">
                {isLoading && <LoadingSpinner asOverlay />}
                {
                    isLoginMode ? (<h2>Login Required</h2>) : (<h2>Signup Required</h2>)
                }
                <hr />
                <form onSubmit={authSubmitHandler}>
                    {
                        //Ako smo u signup mode prikazi input sa Name inputom
                        !isLoginMode && <Input
                            element="input"
                            id="name"
                            type="text"
                            label="Your Name"
                            validators={[VALIDATOR_REQUIRE()]}
                            errorText="Please enter a name."
                            onInput={inputHandler} />
                    }
                    {!isLoginMode && <ImageUpload onInput={inputHandler} errorText="Please provide an image" center id="image"/>}
                    <Input
                        id="email"
                        element="input"
                        type="email"
                        label="Email"
                        validators={[VALIDATOR_EMAIL()]}
                        errorText="Please enter a valid email address"
                        onInput={inputHandler} />

                    <Input
                        id="password"
                        element="input"
                        type="password"
                        label="Password"
                        validators={[VALIDATOR_MINLENGTH(6)]}
                        errorText="Please enter a valid password, at least 6 characters"
                        onInput={inputHandler} />

                    <Button type="submit" disabled={!formState.isValid}>
                        {isLoginMode ? 'LOGIN' : 'SIGNUP'}
                    </Button>
                </form>
                <Button inverse onClick={switchModeHandler}>SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}</Button>
            </Card>
        </>
    )
}

export default Auth

/**
 *  const response = await sendRequest('http://localhost:5000/api/users/login', {
                    //konfigurisemo fetch za POST request
                    method: 'POST',
                    headers: {
                        //sadrzi JSON podatke
                        'Content-Type': 'application/json'
                    },
                    //body uvijek mora biti u json formatu
                    //sadrzi samo email i password
                    //Posaljemo na server kao body objekat, tako da na serveru dohvacamo kao req.body.email i req.body.password
                    body: JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    })
                })
 */