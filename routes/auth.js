const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/singup', authController.getSingup);

router.post('/singup', authController.postSingup);

router.post('/logout', authController.postLogout);

router.get('/reset/:token', authController.getResetWToken);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.post('/update-password', authController.postNewPassword);

module.exports = router;