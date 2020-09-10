const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')


const getUsers = async (req, res, next) => {
    let users
    try {
        users = await User.find({}, '-password')
    } catch (error) {
        const err = new HttpError('Fetching users failed, please try again later', 500)
        return next(err)
    }

    console.log(users)
    //Posto find vraca niz koristimo map da bismo prosli kroz sve objekte i pretvorili _id u id, odnosno da ih pretvorimo u standardne javascript objekte, do sad su bili mongoose objekti
    res.status(200).json({ users: users.map(user => user.toObject({ getters: true })) })
}

const signup = async (req, res, next) => {
    const errors = validationResult(req)
    let existingUser
    const { name, email, password } = req.body
    let hashedPassword
    let token

    //sta je god asinhrono dobro je da ga stavimo u try/catch
    try {
        //bycript.hash vrati promise
        hashedPassword = await bcrypt.hash(password, 12)
    } catch (error) {
        const err = new HttpError('Could not create user, please try again', 500)
        return next(err)
    }

    if (!errors.isEmpty()) {

        const err = new HttpError('Invalid inputs passed, please check your data', 422)
        return next(err)
    }

    try {
        //provjerimo da li ima vec email u bazi
        //findOne matchira jedan dokument koji odgovara kriterijumu koji smo proslijedili kao argument
        //findOne vraca objekat, find vraca niz
        existingUser = await User.findOne({ email: email })
    } catch (error) {
        const err = new HttpError('Signing up failed, please try again later', 500)
        return next(err)
    }
    console.log('existingUser', existingUser)
    if (existingUser) {
        const error = new HttpError('User Exists already, please login instead', 422)
        return next(error)
    }

    const createdUser = new User({
        name: name,
        email: email,
        image: req.file.path,
        password: hashedPassword,
        places: []
    })

    try {
        await createdUser.save()
    } catch (error) {
        const err = new HttpError('Signing up failed, please try later', 500)
        return next(err)
    }

    //token kreacija moze da fail, pa ga stavimo u try/catch
    //nakon sto validiramo registraciju usera, onda generisemo token
    try {
        //Generisemo token
        //prvi argument je payload, string, objekat ili buffer
        //id je getter koji nam daje mongoose koji kreira na svakom user document objektu
        //drugi argument je private key, string kojeg samo server zna, nikad ga ne dijelimo sa frontendom(klijentom)
        //treci argument je opcionalan gdje mozemo konfigurisati token
        token = jwt.sign(
            //payload koji posaljemo useru, id i email od usera 
            { userId: createdUser.id, email: createdUser.email },
            //private key koji samo server zna
            'super_secret_dont_share',
            //postavljanjem expiresIn je dobra praksa, znaci da bi trebali konfigurisati token sa expiresIn
            { expiresIn: '1h' }
        )
    } catch (error) {
        const err = new HttpError('Signing up failed, please try later', 500)
        return next(err)
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token  })
}

const login = async (req, res, next) => {
    const { email, password } = req.body
    let isValidPassword = false
    let existingUser
    let token

    try {
        //provjerimo da li ima vec email u bazi
        //findOne matchira jedan dokument koji odgovara kriterijumu koji smo proslijedili kao argument
        //findOne vraca objekat, find vraca niz
        existingUser = await User.findOne({ email: email })
    } catch (error) {
        const err = new HttpError('Logining in failed, please try again later', 500)
        return next(err)
    }
    //Ako nemamo usera, ili ako password iz baze nije jednak koji je user unio
    if (!existingUser) {
        const err = new HttpError('Invalid credentials, could not log you in', 403)
        return next(err)
    }

    try {
        //provjeravamo da li je isti password koji dobijemo sa frontenda i onaj iz baze
        isValidPassword = await bcrypt.compare(password, existingUser.password)
    } catch (error) {
        const err = new HttpError('Could not log you in, please check your credentials and try again', 500)
        return next(err)
    }
    //ako password nije validan
    if (!isValidPassword) {
        const err = new HttpError('Invalid credentials, could not log you in', 401)
        return next(err)
    }

     //token kreacija moze da fail, pa ga stavimo u try/catch
     //nakon sto validiramo da postoji user sa odredjenim emailom, i nakon sto validiramo password, onda generisemo token
     try {
        //Generisemo token
        //prvi argument je payload, string, objekat ili buffer
        //id je getter koji nam daje mongoose koji kreira na svakom user document objektu
        //drugi argument je private key, string kojeg samo server zna, nikad ga ne dijelimo sa frontendom(klijentom)
        //treci argument je opcionalan gdje mozemo konfigurisati token
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            'super_secret_dont_share',
            //postavljanjem expiresIn je dobra praksa, znaci da bi trebali konfigurisati token sa expiresIn
            { expiresIn: '1h' }
        )

    } catch (error) {
        const err = new HttpError('Logging in failed, please try later', 500)
        return next(err)
    }

    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token
    })
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login