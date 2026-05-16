const express = require('express');
const router = express.Router();
const { signup, login, getMe, logout } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate, signupSchema, loginSchema } = require('../middleware/validate');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

module.exports = router;
