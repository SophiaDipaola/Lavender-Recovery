const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig')
const cloudinary = require('cloudinary');
const multer = require('multer');
const uploads = multer({ dest: '../tmp/uploads/' });
const isLoggedIn = require('../middleware/isLoggedIn')
const method = require('method-override')
router.use(method('_method'));

router.get('/', isLoggedIn, (req, res) => {
  
  const { id, name, email } = req.user.get();
  db.user.findOne({
    where: {id}
  })
  .then(user=>{
    console.log(user.get())
    const { profileImage } = user.get()
    const { bio } = user.get()
    db.post.findAll({
      where: { userId: res.locals.currentUser.id }
    })
    .then(postsArray => {
        console.log(postsArray);
      res.render('profile', { id, name, email, profileImage, bio, postsArray })
    })
  })
}); 

router.post('/', uploads.single('inputFile'), (req, res)=>{
    const image = req.file.path
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
          console.log(`${user.name} was created....`);       
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

router.get('/editpost', (req,res)=>{
  res.render('editpost')
})

router.post('/editpost', (req,res)=>{
  db.user.findOne({
    where: {
       id: req.user.id
  }
  }) .then((userFound)=>{
    console.log(userFound,'😢')
    db.post.create({
      title: req.body.title,
      content: req.body.content
    }).then ((newPost)=> {
      console.log(newPost)
        userFound.addPost(newPost)
     console.log(`you created a post ${newPost.title}`)
    })
    res.redirect('/profile')
  })
})


router.delete('/:id', (req, res) => {
  db.post.findOne({ where: {
    id: req.params.id
  }}).then(post => {
    post.destroy();
    console.log("A post was deleted.");
    res.redirect('/profile');
  }).catch(error => {
    console.log('An error occured during a Delete');
    res.redirect('/profile');
  });
});

router.get('/editbio', (req,res)=>{
 db.user.findOne({
   where: {
     id: req.user.id
   }
 }).then(user=>{
  res.render('editbio', {user})
 })
})

router.put('/', (req,res)=>{
  db.user.update({
    bio: req.body.bio
  },
    { 
    where:{
    id: req.user.id
  }}).then(bio =>{
    res.redirect('/profile')
  })
})


module.exports = router