var db = require('./index').open({
  db: 'yummy',
  host: 'ds037987.mongolab.com',
  port: 37987,
  user: 'guest',
  password: '123456'
});

// No need to open collections anymore, just call them as you would with the mongo client
db.drink.findOne({name: 'Dom Perignon'}, function(err, domPerignon) {
  console.log('A good wine:\n', err || domPerignon, '\n');
});

// 'findAll' returns all the elements of a collection (equiv to find + toArray) 
db.meal.findAll({from: 'France'}, function(err, frenchMeals) {
  console.log('French meals:\n', err || frenchMeals, '\n');
});

// Easy parallel queries: callback returns when all queries return or earlier if error
db([
  ['drink', 'findOne', {price: 'free'}],
  ['meal', 'findOne', {price: 'cheap'}],
  ['dessert', 'findAll', {quality: "good"}, {fields: {name: 1, _id: 0}}]
], function(err, drink, meal, desserts) {
  if (err) throw err;
  console.log('Drink:\n', drink);
  console.log('Meal:\n', meal);
  console.log('Desserts:\n', desserts, '\nBon appetit!\n');  
});

// Closing DB after 3 seconds
setTimeout(function() {
  db.close();
}, 3000);