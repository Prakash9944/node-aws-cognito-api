const express = require('express');
const authController = require('../controllers/AuthController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/signup', authController.SignUp);
router.post('/signin', authController.SignIn);
router.post('/upload', upload.single('file'), authController.uploadFile);
router.get('/audio/lists', authController.listsAudio);
router.post('/verify', authController.Verify);
router.get('/audio/:fileName', authController.fetchContent);

module.exports = router;