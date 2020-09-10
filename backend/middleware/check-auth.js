const HttpError = require('../models/http-error')
const jwt = require('jsonwebtoken')

//middleware koji validira requests za token
module.exports = (req, res, next) => {
    //dobijemo 'error' da imamo options request umjesto post, tako da provjeravamo da li je options, ako jest next proslijedimo na sledeci middleware
    //Odnosno da nas options request ne blokira
    if(req.method === 'OPTIONS'){
        return next()
    }
    /**
     * trebamo paziti je da kad splitamo i ako auth headers nisu postavljeni sve ce se crash i generisati
        error umjesto undefined za token.trebamo koristiti try/catch
     */
    try {
        //provjeravamo da li imamo token i da li je validan
        //da spasavamo tokense u headerse
        const token = req.headers.authorization.split(' ')[1] //Authorization: 'Bearer TOKEN'
        console.log('req.headers -> check-auth.js', req.headers)
        //ako nemamo tokena idi u catch blok i prekini izvrsavanje koda
        if (!token) {
            //ako nemamo errora throwamo error da bi otislo dalje do catch bloka
           throw new Error('Authentication failed')

        }
        //ako imamo token verificiraj ga
        //verificiramo token, odnsono dobijemo nazad objekat kao payload u kojem je userId i email
        const decodedToken = jwt.verify(token, 'super_secret_dont_share')
        console.log('decodedToken - check-auth.js', decodedToken)
        //u req objekat dodamo userData property
        //iz check-auth middleware saljemo userData objekat koji smo dodali dinamicki a u kojem je userId, a koje mozmeo da dohvatimo u sljedecem middleware-u
        req.userData = {userId: decodedToken.userId}
        next()
    }catch(err){
        const error = new HttpError('Authenitcation failed', 403)
        return next(error)
    }

}

