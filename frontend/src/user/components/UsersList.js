//Komponenta koja ispisuje poruku da nismo nasli usera ukoliko je users objekat prazan, ukoliko imamo users proslijedimo vrijednosti objekta u UsersItem komponentu
import React from 'react'

import UserItem from './UserItem'
import Card from '../../shared/components/UIElements/Card'
import './UsersList.css'

const UsersList = (props) => {
    //ako nemamo itemsa vrati poruku
    if (props.items.length === 0) {
        return (
            <div className="center">
                <Card>
                    <h2>No users found.</h2>
                </Card>
            </div>
        )
    }

    return <ul className="users-list">
        {props.items.map(user => {
            return (
                <UserItem
                    key={user.id}
                    //id smo proslijedili da bismo ga mogli postaviti kao url pomocu Link
                    id={user.id}
                    image={user.image}
                    name={user.name}
                    placeCount={user.places.length} />
            )
        })}
    </ul>
}

export default UsersList