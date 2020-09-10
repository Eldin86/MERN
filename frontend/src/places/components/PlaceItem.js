import React, { useState, useContext } from 'react'

import { useHttpClient } from '../../shared/hooks/http-hook'
import Button from '../../shared/components/FormElements/Button'
import Card from '../../shared/components/UIElements/Card'
import Modal from '../../shared/components/UIElements/Modal'
import Map from '../../shared/components/UIElements/Map'
import { AuthContext } from '../../shared/context/auth-context'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import './PlaceItem.css'

const PlaceItem = props => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient()
    const auth = useContext(AuthContext)
    const [showMap, setShowMap] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const openModalHandler = () => setShowMap(true)

    const closeModalHandler = () => setShowMap(false)

    const showDeleteWarningHandler = () => {
        setShowConfirmModal(true)
    }

    const cancelDeleteHandler = () => {
        setShowConfirmModal(false)
    }

    const confirmDeleteHandler = async () => {
        setShowConfirmModal(false)
        try {
            await sendRequest(
                `http://localhost:5000/api/places/${props.id}`,
                'DELETE',
                null,
                //ovdje dodamo token u delete request
                {Authorization: 'Bearer ' + auth.token}
            )
            props.onDelete(props.id)
        } catch (error) {

        }
    }

    console.log('props.location -> PlaceItem', props.coordinates)



    return (
        <>
            <ErrorModal error={error} onClear={clearError}/>
            <Modal
                show={showMap}
                //handler kojim zatvaramo modal klikom na Backdrop
                onCancel={closeModalHandler}
                //adresa koja se nalazi u headeru
                header={props.address}
                contentClass="place-item__modal-content"
                footerClass="place-item__modal-actions"
                //u footer proslijedimo buttone kao JSX
                footer={<Button onClick={closeModalHandler}>CLOSE</Button>}>
                <div className="map-container">
                    <Map center={props.coordinates} zoom={16} />
                </div>
            </Modal>

            <Modal
                show={showConfirmModal}
                onCancel={cancelDeleteHandler}
                header="Are you sure"
                footerClass="place-item__modal-actions"
                footer={
                    <>
                        <Button onClick={cancelDeleteHandler} inverse>CANCEL</Button>
                        <Button onClick={confirmDeleteHandler} danger>DELETE</Button>
                    </>
                }>
                <p>Do you want to proceeed and delete this place?
                        Please note that it can't be undone thereafter</p>
            </Modal>

            <li className="place-item">
                <Card className="place-item__content">
                    {isLoading && <LoadingSpinner asOverlay/>}
                    <div className="place-item__image">
                        <img src={`http://localhost:5000/${props.image}`} alt={props.title} />
                    </div>
                    <div className="place-item__info">
                        <h2>{props.title}</h2>
                        <h3>{props.address}</h3>
                        <p>{props.description}</p>
                    </div>
                    <div className="place-item__actions">
                        <Button onClick={openModalHandler} inverse>VIEW ON MAP</Button>
                        {/* ako smo logovani prikazi edit button koji vodi na poseban page za editovanje */}
                        {auth.userId === props.creatorId && (
                            //klikom na edit vodi nas na novi link, posto smo proslijedili to property i kreirali smo react Link}
                            < Button to={`/places/${props.id}`}>EDIT</Button>
                        )}
                        {/* ako smo logovani prikazi delete button */}
                        {auth.userId === props.creatorId && (
                            <Button onClick={showDeleteWarningHandler} danger>DELETE</Button>
                        )}
                    </div>
                </Card>
            </li>
        </>
    )
}

export default PlaceItem