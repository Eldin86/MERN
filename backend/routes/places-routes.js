const express = require('express')
const { check } = require('express-validator')

const placesControllers = require('../controllers/places-controllers')
const fileUpload = require('../middleware/file-upload')
const checkAuth = require('../middleware/check-auth')

const router = express.Router()

/* GET requests */
router.get('/user/:uid', placesControllers.getPlacesByUserId)

router.get('/:pid', placesControllers.getPlaceById)

/**
 * mozemo dodati middleware za sve ove routes u places-routes sto osigurava da requests moraju imati 
 * token. ako koristimo routes.use mozemo dodati middleware na bilo koji request koji dodje do tog 
 * middleware
 */
/**
 * ako dodamo middleware na ovo mjesto /:pid i /user/:uid ce biti dostupni svima, dok sve 
 * ispod middleware nece biti dostupno svima
 */
//https://www.youtube.com/watch?v=mbsmsi7l3r4
router.use(checkAuth)

/* POST requests */
router.post('/',
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty()
    ],
    placesControllers.createPlace)

/* PATCH requests */
router.patch('/:pid', [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
],
    placesControllers.updatePlace)

/* DELETE requests */
router.delete('/:pid', placesControllers.deletePlace)

module.exports = router

/**
 * PATCH requests are meant for partially updating an existing resource.
*  PUT is more of an "upsert" operation in that it can replace an existing resource entirely or create one.
 */