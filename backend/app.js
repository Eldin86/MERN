/* **** PRVO PISTATI FRONTEND  **** */
//logovan na mongoDB atlas preko maslesaeldin@ emaila
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error')

const app = express()

//da bismo izbjegli DeprecationWarning
const connectConfig = { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true 
  }
//registrujemo middleware pomocu app.use() metode
app.use(bodyParser.json())

//treba da dozvolimo pristup slikama na backendu
app.use('/uploads/images', express.static(path.join('uploads', 'images')))

//Middleware koji koristimo da ne bismo imali CORS errore
//Registrujemo ga za sve routes
app.use((req, res, next) => {
    res.setHeader(
        //dozvoljava kontrolu koje domene ce imati pristup, gdje ce browser dozvoliti
        'Access-Control-Allow-Origin', '*'
    )
    //odredimo koje headerse ovi requesti poslani od strane browsera mogu imati
    res.setHeader(
        //kontrolise koje headers dolazeci requests mogu imati tako da ih handlamo
        'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    res.setHeader(
        //dozvoljava koje metode su dozvoljene na frontendu
        'Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE'
    )
    next()
})

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404)
    throw error;
})

//Error middleware posto ima 4 argumenta?
//general error handling middleware
app.use((err, req, res, next) => {
    //ako imamo error, i ako imamo file u req objektu zelimo ga pobrisati
    if(req.file){
        //brisemo file
        //zelimo da pobrisemo sliku ukoliko imamo gresku, unlink prima i callback koji okine kad se brisanje zavrseno
        fs.unlink(req.file.path, (err) => {
            console.log(err)
        })
    }
    console.log('res.headerSent', res.headersSent)
    if (res.headersSent) {
        return next(err)
    }
    res.status(err.code || 500)
    res.json({ message: err.message || 'An unkonwn error occurred' })
})


mongoose.connect('mongodb+srv://Eldin86:nwCawvwpFL2BmbUq@cluster0-yawc3.mongodb.net/mern?retryWrites=true&w=majority', connectConfig)
    .then(() => {
        //ako je konekcija uspjesna onda startamo server, ako nije vrati error message
        app.listen(5000, () => {
            console.log('Server is up and running')
        })
    }).catch(error => {
        //Ukoliko imamo error vrati error
        console.log(error)
    })

