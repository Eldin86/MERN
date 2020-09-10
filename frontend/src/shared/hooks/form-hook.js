import { useCallback, useReducer } from 'react'


const formReducer = (state, action) => {
    switch (action.type) {
        case 'INPUT_CHANGE':
            //Ako su svi inputi validni i forma je validna ukupno,
            //ako je jedan input invalidan onda cijela forma je invalidna
            let formIsValid = true
            //console.log('formIsValid', formIsValid)
            //prodjemo kroz sve inpute u formi i vidimo da li su svi inputi validni
            for (let inputId in state.inputs) {
                //ako nemamo odredjenog inputa continue
                if(!state.inputs[inputId]){
                    continue
                }
                console.log('inputId -> NewPlace', inputId)
                
                if (inputId === action.inputId) {
                    //sprema vrijednost true ili false u formIsValid
                    formIsValid = formIsValid && action.isValid
                    console.log('action.isValid', action.isValid)
                    console.log('formIsValid', formIsValid)
                } else {
                    //validira polje u ovisnosti koji id je, title ili description, name, address...
                    formIsValid = formIsValid && state.inputs[inputId].isValid
                    console.log('state.inputs[inputId].isvalid', state.inputs[inputId].isValid)
                }

                console.log('formIsValid', formIsValid)
            }

            return {
                ...state,
                inputs: {
                    //kopiramo odredjeno polje
                    ...state.inputs,
                    //updatujemo odredjeno polje sa novim vrijednostima
                    [action.inputId]: {
                        value: action.value,
                        //posebno input polje, da li je validno ili ne
                        isValid: action.isValid
                    }
                },
                //cjelokupna forma da li je validna ili ne
                isValid: formIsValid
            }
        case 'SET_DATA':
            return   {
                inputs: action.inputs,
                isValid: action.formIsValid
            }
        default:
            return state
    }
}

//kao argument u useForm proslijedimo input elemente kao objekte sa vrijednostima value i isValid, kao i initialFormValiditi sto predstavlja inicijalno forma da li je validna
export const useForm = (initialInputs, initialFormValidity) => {
    const [formState, dispatch] = useReducer(formReducer, {
        inputs: initialInputs,
        //da li je cijela forma validna
        isValid: initialFormValidity
    })
    //validiramo vrijednosti iz input komponente koje smo dobili kao argumente
    const inputHandler = useCallback((id, value, isValid) => {
        dispatch({
            //actions - parametri
            type: 'INPUT_CHANGE',
            //vrijednost inputa
            value: value,
            //da li je validan ili ne
            isValid: isValid,
            //title ili description, email, address....
            inputId: id
        })
    }, [])

    const setFormData = useCallback((inputdata, formValidity) => {
        dispatch({
            type: 'SET_DATA',
            //inputs objekti sa value i isValid vrijednostima
            inputs: inputdata,
            //true or false
            formIsValid: formValidity
        })
    }, [])

    return [formState, inputHandler, setFormData]
}