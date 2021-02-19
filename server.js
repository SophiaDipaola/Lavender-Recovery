require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const passport = require('./config/ppConfig');
const flash = require('connect-flash');
const isLoggedIn = require('./middleware/isLoggedIn');
const cloudinary = require('cloudinary');
const multer = require('multer');
const uploads = multer({ dest: './tmp/uploads/' });
const db = require('./models')
const method = require('method-override')

app.set('view engine', 'ejs');

const router = express.Router();
const SECRET_SESSION = process.env.SECRET_SESSION
const sessionObject = {
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true
}
app.use(session(sessionObject));
// to get passport to run throughout app
app.use(passport.initialize())
app.use(passport.session())
// flash middleware
app.use(flash())

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);

// FLASH
app.use((req, res, next) => {
  res.locals.alerts = req.flash()
  res.locals.currentUser = req.user
  next()
});

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/', uploads.single('myFile'), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    res.send(result);
  });
});


app.post('/images', uploads.single('inputFile'), (req, res) => {
  // grab the uploaded file
  const image = req.file.path;
  console.log(image);
  // upload image to cloudinary
  cloudinary.uploader.upload(image, (result) => {
      // the result that comes back from cloudinary
      console.log(result);
      res.render('index', { image: result.url })
  })

})

app.use('/auth', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
