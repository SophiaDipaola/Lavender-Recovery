const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig')
const cloudinary = require('cloudinary');
const multer = require('multer');
const uploads = multer({ dest: '../uploads/' });


router.post('/', uploads.single('inputFile'), (req, res)=>{
    const image = req.file.path
    console.log(image)
    console.log(req.body)
    cloudinary.uploader.upload(image, (result) =>{
      console.log(result)
      db.user.findOrCreate({
        where: { email: req.body.email },
        defaults: { 
            name: req.body.name, 
            password: req.body.password,
            bio:req.body.bio,
            profileImage: result.url
        }

      })
      .then(([user, created]) => {
        if (created) {
          // if created, success and we will redirect back to / page
          console.log(`${user.name} was created....`);
          // flash messages
          const successObject = {
            successRedirect: '/profile',
            successFlash: `Welcome ${user.name}. Account was created and logging in...`
          }
          // passport authenicate
          passport.authenticate('local', successObject)(req, res);
        } else {
          // Send back email already exists
          req.flash('error', 'Email already exists');
          res.redirect('/auth/signup');
        }
      })
      .catch(error => {
        console.log('**************Error');
        console.log(error);
        req.flash('error', 'Either email or password is incorrect. Please try again.');
        res.redirect('/auth/signup');
      });
    })
})
   
module.exports = router