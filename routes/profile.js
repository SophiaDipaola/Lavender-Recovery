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

router.delete('/', async(req,res)=>{
  try{
      await db.post.destroy({ where: {id: req.body.delete.postItem}})
  console.log(`post Deleted`)
  res.redirect('/profile')
  } catch(e){
      console.log(`error occured, ${postItem} was not deleted`)
      res.redirect('/profile')
  }
})


router.get('/editbio', (req,res)=>{
  res.send('edit bio time')
})



module.exports = router