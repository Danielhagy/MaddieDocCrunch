const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('username').isLength({ min: 3, max: 30 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Local auth routes
router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);

// OAuth routes
router.get('/oauth', passport.authenticate(process.env.OAUTH_PROVIDER));
router.get('/callback', 
  passport.authenticate(process.env.OAUTH_PROVIDER, { session: false }), 
  AuthController.oauthSuccess
);

// Protected routes
router.get('/profile', authenticateJWT, AuthController.getProfile);

module.exports = router;
