import React, { useRef, useState, useEffect } from 'react'

import Button from './Button'
import './ImageUpload.css'

const ImageUpload = props => {
    const [file, setFile] = useState()
    const [previewUrl, setPreviewUrl] = useState()
    const [isValid, setIsValid] = useState(false)
    const filePickerRef = useRef()

    const pickedHandler = (e) => {
        let pickedFile
        let fileIsValid = isValid
        //ako imamo input file, onda defaultno dobijemo e.target.file vrijednost
        //ako imamo file, i ako smo izabrali samo jedan file
        if (e.target.files && e.target.files.length === 1) {
            pickedFile = e.target.files[0]
            console.log('pickedFile', pickedFile)
            setFile(pickedFile)
            setIsValid(true)
            fileIsValid = true
        } else {
            setIsValid(false)
            fileIsValid = false
        }
        props.onInput(props.id, pickedFile, fileIsValid)
    }

    useEffect(() => {
        //ako nemmao fajla odnosno ako je undefined
        if (!file) {
            return
        }
        //FileReader nam pomaze da parsiramo fajlove, odnosno da ih citamo
        const fileReader = new FileReader()
        //na file reader moramo da registrujemo onLoad i da izvrsimo funkciju kad god je zavrseno parsiranje fajla
        //prije nego pozovemo readAsDataURL moramo da registrujemo na fileReader onload funkciju
        fileReader.onload = () => {
            setPreviewUrl(fileReader.result)
        }
        //kreiramo url koji mozemo da output
        fileReader.readAsDataURL(file)
        console.log('fileReader', fileReader)

    }, [file])

    const pickImageHandler = () => {
        filePickerRef.current.click()
    }
    return (
        <div className="form-control">
            <input ref={filePickerRef} onChange={pickedHandler} id={props.id} style={{ display: 'none' }} type="file" accept=".jpg, .png, .jpeg" />
            <div className={`image-upload ${props.center && 'center'}`}>
                <div className="image-upload__preview">
                    {previewUrl && <img src={previewUrl} alt="Preview" />}
                    {!previewUrl && <p>Please pick an image!</p>}
                </div>
                <Button type="button" onClick={pickImageHandler}>PICK IMAGE</Button>
            </div>
            {!isValid && <p>{props.errorText}</p>}
        </div>
    )
}

export default ImageUpload