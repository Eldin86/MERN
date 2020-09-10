const mongoose = require('mongoose')

const Schema = mongoose.Schema

//kreiramo Schema za Place
const placeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String, 
        required: true
    },
    address: {
        type: String,
        required: true
    },
    //Ako bude problema pogledati ovo
    location: {
        type: Array,
        required: true
    },
    creator: {
        type: mongoose.Types.ObjectId,
        required: true,
        //Referenca na User Schema
        ref: 'User'
    }
})
//konvencija je da koristimo prvo veliko pocetno slovo i jedninu
module.exports = mongoose.model('Place', placeSchema)