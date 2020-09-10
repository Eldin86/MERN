import React, { useReducer, useEffect } from 'react'

import {validate} from '../../util/validators'
import './Input.css'

const inputReducer = (state, action) => {
    switch (action.type) {
        case 'CHANGE':
            return {
                ...state,
                //spremimo vrijednost iz inputa
                value: action.val,
                //da li je validan input ili ne nakon validacije
                isValid: validate(action.val, action.validators)
            }
        case 'TOUCH': 
        //da mo kliknuli na input i opet kliknuli van input polja
            return {
                ...state,
                isTouched: true
            }
        default:
            return state
    }
}

const Input = props => {
    const [inputState, dispatch] = useReducer(inputReducer, { 
        //ako imamo value da smo proslijedili inace ''
        value: props.initialValue || '', 
        //vrati true ili false u ovisnosti ako je input validan ili ne
        isValid: props.initialIsValid || false, 
        isTouched: false 
    })
    const {id, onInput} = props
    //vrijednost inputa i da li je validan ili ne input
    const {value, isValid} = inputState
    
    useEffect(() => {
        //samo proslijedimo vrijednost u form-hook.js odradimo ostalo
        onInput(id, value, isValid)
    }, [id, value, isValid, onInput])

    const changeHandler = event => {
        console.log('props.validators', props.validators)
        dispatch({ 
            type: 'CHANGE', 
            //val -> vrijednost inputa koju trebamo porlsijediti u validate metodu
            val: event.target.value, 
            //props.validators -> objekat koji vraca tip validatora (i vrijednost) 
            validators: props.validators 
        })
        console.log('props.validators -> Input', props.validators)
    }
    const touchHandler =() => {
        dispatch({
            type: 'TOUCH'
        })
    }


    //checks if element is of type input or textarea, so it creates element based on that check
    const element = props.element === 'input' ? (<input
        id={props.id}
        type={props.type}
        placeholder={props.placeholder}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value} />
    ) : (
            <textarea
                id={props.id}
                rows={props.rows || 3}
                onChange={changeHandler}
                onBlur={touchHandler}
                value={inputState.value} />
        )

    return (
        <div className={`form-control ${!inputState.isValid && inputState.isTouched && 'form-control--invalid'}`}>
            <label htmlFor={props.id}>{props.label}</label>
            {element}
            {!inputState.isValid && inputState.isTouched && <p>{props.errorText}</p>}
        </div>
    )
}

export default Input