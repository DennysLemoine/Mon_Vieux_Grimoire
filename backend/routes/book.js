const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { upload, processImage } = require('../middleware/multer-config');

const bookCtrl = require('../controllers/book');

router.get('/',  bookCtrl.getAllBook);
router.get('/bestrating', bookCtrl.getBestRating);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, upload, processImage, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);
router.put('/:id', auth, upload, processImage, bookCtrl.modifyBook);
router.put('/:id/rating', auth, bookCtrl.updateBookRating);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;