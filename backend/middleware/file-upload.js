const multer = require('multer')
const { v4: uuidv4 } = require('uuid');

const MIME_TYPE_MAP = {
   'image/png': 'png',
   'image/jpg': 'jpg',
   'image/jpeg': 'jpeg',
}

//konfigurisemo multer, gdje da spremimo sliku, koje fajlove da prihvati, velicnu slike
const fileUpload = multer({
    //velicina slike
    limits: 500000,
    storage: multer.diskStorage({

        destination: (req, file, cb) => {
            cb(null, 'uploads/images')
        },
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype]
            cb(null, uuidv4() + '.' + ext)
        }
    }),
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype]
        let error = isValid ? null : new Error('Invalid Mime Type!')
        cb(error, isValid)
    }
})

module.exports = fileUpload