function isLoggedIn(req, res, next) {
  if (!req.user) {
    req.flash('error', 'you must be logged in to access page')
    res.redirect('/');
  } else {
    next()
  }
}

module.exports = isLoggedIn
