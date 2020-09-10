import { useState, useCallback, useRef, useEffect } from 'react'

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState()

    const activeHttpRequests = useRef([])

    //url => url koji dohvacamo, method => metoda koju koristimo, body => response koji dobijemo, defaultno null, headers => setup headersa
    const sendRequest = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
        setIsLoading(true)
        //The AbortController interface represents a controller object that allows you to abort one or more Web requests as and when desired.
        const httpAbortCtrl = new AbortController()
        activeHttpRequests.current.push(httpAbortCtrl)
        //console.log('activeHttpRequests', activeHttpRequests)

        try {
            const response = await fetch(url, {
                method: method,
                body: body,
                headers: headers,
                //grab a reference to its associated AbortSignal object using the AbortController.signal property.
                //za rollback upload slike? odnosno cancel?
                signal: httpAbortCtrl.signal
            })

            const responseData = await response.json()

            activeHttpRequests.current = activeHttpRequests.current.filter(reqCtrl => reqCtrl !== httpAbortCtrl.abort())

            //ok property je property koji postoji na response objektu, true je ako imamo 200 status code, dok 400 i 500 code su false
            if (!response.ok) {
                //throw error koji smo generlisali na backendu, i automatski ide u catch block
                throw new Error(responseData.message)
            }
            setIsLoading(false)
            return responseData
        } catch (error) {
            setError(error.message)
            setIsLoading(false)
            throw error
        }
    }, [])

    const clearError = () => {
        setError(null)
    }

    useEffect(() => {
        return() => {
            activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort())
        }
    }, [])

    return { 
        isLoading: isLoading, 
        error: error, 
        sendRequest: sendRequest, 
        clearError: clearError 
    }
}