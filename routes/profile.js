const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig')
const cloudinary = require('cloudinary');
const multer = require('multer');
const uploads = multer({ dest: '../tmp/uploads/' });
const isLoggedIn = require('../middleware/isLoggedIn')

router.get('/', isLoggedIn, (req, res) => {
  
  const { id, name, email } = req.user.get();
  db.user.findOne({
    where: {id}
  })
  .then(user=>{
    console.log(user.get())
    const { profileImage } = user.get()
    const { bio } = user.get()
    res.render('profile', { id, name, email, profileImage, bio }
    )
  })
}); 

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
        res.redirect('/');
      });
    })
})


//get route for edit post
router.get('/')
//post route for edit post
router.post
//get route for edit bio
router.get
//post route for edit bio
router.post

//get route to find user that the post is associated with
router.get('/', (req,res) => {
  db.post.findAll({
    where: { userId: res.locals.currentUser.id }
  })
  .then(postsArray => {
      console.log(postArray);
      res.render('/')
  })
});
//delete route for deleting created posts on profile landing view
// /*router.delete('/profile', (req, res) => {
//   db.post.findOne({ where: {
//     postId: req.params.
//   .then(post => {
//     post.destroy();
//     console.log("A post was deleted.");
//     res.redirect('/profile');
//   }).catch(error => {
//     console.log('An error occured during a Delete');
//     res.redirect('/profile');
//   })
// // }); *

module.exports = router