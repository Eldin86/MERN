const express = require('express')
const { check } = require('express-validator')

const usersControllers = require('../controllers/users-controllers')
const fileUpload = require('../middleware/file-upload')

const router = express.Router()

/* GET requests */

router.get('/', usersControllers.getUsers)

/* POST requests */
router.post('/signup',[
    fileUpload.single('image'),
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(), //normalizeEmail => Test@test.com => test@test.comn
    check('password').isLength({min: 6})
    ],
     usersControllers.signup)

router.post('/login', usersControllers.login)



module.exports = router