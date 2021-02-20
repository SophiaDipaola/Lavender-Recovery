const db = require('./models')

db.post.create({
    title: 'pikachu'
  }).then(function(poke) {
    console.log('Created: ', poke.title)
  })
  
  db.post.findAll().then(function(poke) {
    console.log('Found: ', poke)
  })