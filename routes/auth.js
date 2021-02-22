const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig')

router.post('auth/signup', (req, res) => {
  db.user.findOrCreate({
    where: { email: req.body.email },
    defaults: {
      name: req.body.name,
      password: req.body.password,
      profileImage: req.body.profileImage,
      bio: req.body.bio
    }
  })
    .then(([user, created]) => {
      if (created) {
        passport.authenticate('local', {
          successRedirect: '/profile',
          successFlash: 'Account created and logged in'
        })(req, res);
      } else {
        console.log('Email already exists');
        req.flash('error', 'Email already exists');
        res.redirect('auth/signup');
      }
    })
    .catch(error => {
      req.flash('error', error.message);
      console.log('An error occured: ', error.message)
      res.redirect('auth/signup');
    })
});

router.post('/', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/',
  failureFlash: 'Invalid email and/or password',
  successFlash: 'You have logged in'
}));

router.get('/logout', (req, res) => {
  req.logOut()
  req.flash('success', 'Logging out see you next time')
  res.redirect('/')
});



router.get('/signup', (req, res) => {
  res.render('auth/signup');
});


module.exports = router;
