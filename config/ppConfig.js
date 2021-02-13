const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const db = require('../models');

passport.serializeUser((user, cb)=> {
  cb(null, user.id);
})

passport.deserializeUser((id, cb)=> {
  db.user.findByPk(id)
  .then(user => {
    if (user) {
      cb(null, user);
    }
    console.log('user is null')
  })
  .catch(err=> {
    console.log('error')
    console.error(err)
  })
})


passport.use(new LocalStrategy({
  usernameField: 'email',
  passowrdField: 'password'
}, (email, password, cb) => {
  db.user.findOne({
    where: { email }
  })
  .then((user)=> {
    //check if a user,
    //check if password is valid
    if (!user || !user.validPassword(password)) {
      cb(null, false);
    } else {
      cb(null, user)
    }
  })
  .catch(error=> {
    console.log(error)
  })
}))

module.exports = passport
