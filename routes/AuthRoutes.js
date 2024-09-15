const express = require('express');
const authController = require('../controllers/AuthController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/signup', authController.SignUp);
router.post('/signin', authController.SignIn);
router.post('/upload', upload.single('file'), authController.uploadFile);
router.post('/verify', authController.Verify);

module.exports = router;