const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
//paket kojim generisemo unikatne kljuceve, v4 je vrsta kljuca koji generisemo, ima vise verzija
const { v4: uuidv4 } = require('uuid');
//i na mjestu gdje imamo middleware moramo da importujemo validationResult iz express-validator paketa
const { validationResult } = require('express-validator')
const fs = require('fs')

const mongoose = require('mongoose')

const Place = require('../models/place')
const User = require('../models/user');

/* GET requests */
const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid
    let place

    try {
        place = await Place.findById(placeId)
    } catch (error) {
        const err = new HttpError('Something went wrong, could not find a place', 500)
        return next(error)
    }

    if (!place) {
        const error = new HttpError('Could not find place for provided id.', 404)
        //vratimo next(error) da bi se zaustavilo izvrsavanje koda
        return next(error)
    }
    console.log('GET Request in Places')
    res.json({ place: place.toObject({ getters: true }) })
}

const getPlacesByUserId = async (req, res, next) => {
    //let places
    let userWithPlaces
    const userId = req.params.uid
    console.log(userId)

    try {
        userWithPlaces = await User.findById(userId).populate('places')
        console.log('userWithPlaces', userWithPlaces)
    } catch (error) {
        const err = new HttpError('Fetching places failed, please try later.', 500)
        return next(err)
    }


    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(new HttpError('Could not find places for provided user id.'), 404)
    }
    //.toObject({getters: true}) -> it is a Mongoose method to convert document into a plain javascript object, ready for storage in MongoDB
    res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) })
}

/* POST requests */
const createPlace = async (req, res, next) => {
    let user
    const errors = validationResult(req)
    const { title, description, address } = req.body
    let coordinates

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422))
    }
    try {
        coordinates = await getCoordsForAddress(address)
    } catch (error) {
        return next(error)
    }

    const createdPlace = new Place({
        title: title,
        description: description,
        address: address,
        location: coordinates,
        image: req.file.path,
        //dohvatimo userData koje smo poslali iz middleware-a
        creator: req.userData.userId
    })

    try {
        //nadjemo usera po id kojeg smo dobili iz check-auth middleware-a
        user = await User.findById(req.userData.userId)
    } catch (error) {
        const err = new HttpError('Creating place failed, please try again', 500)
        return next(err)
    }

    //ako nemamo usera u bazi, odnosno ako nije registrovan
    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404)
        return next(error)
    }

    try {
        /**
         * ako bilo sta podje pogresno u taskovima koji su dio transaction i session sve promjene ce biti 
         * roll back od strane mongoDB
         * ZATO koristimo session i transaction, da user i place spasimo u isto vrijeme
         */
        //1.Korak pokrenuti Session
        const sess = await mongoose.startSession()
        //2.Korak Posto je transaction build in na osnovu session, inicijaliziramo Transacion
        sess.startTransaction()
        //3.Korak kazemo mongoose sta dalje da radimo tj.
        //Spasimo createdPlace u bazu, tj kreiramo novi place, i kreiramo novi unikatni ID
        await createdPlace.save({ session: sess })
        //posto je places niz mozemo da pushamo vrijednosti u njega
        /**
         * behind scene, mongoDB uzme createdPlace id i doda ga placeFieldu unutar usera
         */
        user.places.push(createdPlace)
        await user.save({ session: sess })

        await sess.commitTransaction()
    } catch (error) {
        const err = new HttpError('Creating place failed, please try again', 500)
        return next(err)
    }
    res.status(201).json({ place: createdPlace })
}

/* UPDATE requests */
const updatePlace = async (req, res, next) => {
    let place
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log('errors', errors)
        const err = new HttpError('Invalid inputs passed, please check your data', 422)
        return next(err)
    }

    const { title, description } = req.body
    const placeId = req.params.pid
    console.log('placeId', placeId)

    try {
         place = await Place.findById(placeId)

    } catch (error) {
        const err = new HttpError('Something went wrong, could not update place', 500)
        return next(err)
    }

    //ako user koji nije kreirao place zeli da ga edituje
    //creator nije string nego je objekat tipa mongoose object id poseban tip ID koji koristi mongoose, zato koristimo toString()
    if(place.creator.toString() !== req.userData.userId){
        const err = new HttpError('You are not allowed to edit this place', 401)
        return next(err)
    }

    place.title = title
    place.description = description

    try {
        await place.save()
    } catch (err) {
        const error = new HttpError('Something went wrong could not update place', 500)
        return next(error)
    }

    res.status(200).json({ place: place.toObject({ getters: true }) })
}

/* DELETE requests */
const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid

    let place

    try {
        //sa populate('creator') creator field sadrzi cijeli user objekat
        place = await Place.findById(placeId).populate('creator')
    } catch (error) {
        const err = new HttpError('Something went wrong, could not delete place', 500)
        return next(err)
    }
    console.log('place', place)

    if (!place) {
        const error = new HttpError('Could not find place for this id.', 404)
        return next(error)
    }

    if(place.cretor.id !== req.userData.userId){
        const err = new HttpError('You are not allowed to delete this place', 401)
        return next(err)
    }

    //putanja do foldera u kojem su slike koje spremamo nakon uploadanja 
    const imagePath = place.image
    console.log('imagePath', imagePath)

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await place.remove({ session: sess })
        //pull automatski uklanja id, uklanja ga interno po defaultu, treba da ukloni place iz usera
        place.creator.places.pull(place)
        await place.creator.save({ session: sess })
        await sess.commitTransaction()
    } catch (error) {
        const err = HttpError('Something went wrong, could not delete place', 500)
        return next(err)
    }

    fs.unlink(imagePath, err => {
        console.log(err)
    })

    res.status(200).json({ message: 'Deleted place!' })
}



exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace


/**
 * zelimo da izvrsimo vise operacije koje nisu direktno povezane i ako jedna od operacija fails,
 * odnosno ako creating place ili storing id placea u user document, zelimo da ponistimo sve operacije
 * odnosno da throw error, u stvari zelimo da obje operacije uspiju u isto vrijeme
 * da bismo to dobili koristimo transactions i sessions
 * - transactions koristimo da izvrsimo vise operacija u izolaciji (odvojeno jedna od druge, odnosno neovisno
 *   jedna od druge) u odnosu jedna na drugu. Transactions su build na osnovu sessionsa
 *                  *****
 * da bismo radili sa transactions moramo da pokrenemo sessions, zatim inicijaliziramo transaction i kad je
 * transaction successuful sessions je zavrsena i transaction je commited, places je kreiran i place ID je
 * spremljen u User dokument
 *                  *****
 */
