const express = require('express');
const router = express.Router();
const passport = require('passport');
const { forwardAuthenticated } = require('../config/auth');

router.get('/', forwardAuthenticated, (req, res) => res.redirect('/'));

router.post('/',(req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/',
      failureFlash: true
    })(req, res, next);
  });
  

module.exports = router;