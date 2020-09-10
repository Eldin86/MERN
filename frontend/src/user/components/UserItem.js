//Komponenta koja je postavljena kao React Link i rendera sve propertije iz users objekta, klikom na usera postavlja url /{id usera}/places
import React from 'react'
import { Link } from 'react-router-dom'

import Card from '../../shared/components/UIElements/Card'
import Avatar from '../../shared/components/UIElements/Avatar'
import './UserItem.css'

const UsersItem = (props) => {
    return (
        <li className="user-item">
                <Card className="user-item__content">
                    {/* klikom na karticu usera postavimo url u kojem se nalazi id usera */}
                    <Link to={`/${props.id}/places`}>
                        <div className="user-item__image">
                            <Avatar image={`http://localhost:5000/${props.image}`} alt={props.name} />
                        </div>
                        <div className="user-item__info">
                            <h2>{props.name}</h2>
                            <h3>{props.placeCount} {props.placeCount === 1 ? 'Place' : 'Places'}</h3>
                        </div>
                    </Link>
                </Card>
        </li>
    )
}

export default UsersItem