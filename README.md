# mongo-lazy

Node-mongodb-native for lazy people. Don't ever open a collection again. Eat a piece of cake while doing parallel queries.    
All the methods of node-mongodb-native are available. See [the official documentation][0].

## Installation

    npm install mongo-lazy

## Usage
    
    node --harmony yourScript.js

The --harmony flag is necessary because we're using Harmony proxies to open and cache collections transparently.

## Example

``` js
  // Open a db w/ the 3 args of mongodb.Db(dbName, servConfig, options) or w/ 1 obj-arg like above
  var db = require('mongo-lazy').open({
    db: 'yummy',
    host: 'ds037987.mongolab.com',
    port: 37987,
    user: 'guest',
    password: '123456'
  });

  // No need to open collections anymore, just call them as you would usually do with the mongo CLI
  db.drink.findOne({name: 'Dom Perignon'}, function(err, domPerignon) {
    console.log('A good wine:\n', err || domPerignon, '\n');
  });

  // The 'findAll' method returns all the elements of a collection (equiv to find + toArray) 
  db.meal.findAll({from: 'France'}, function(err, frenchMeals) {
    console.log('French meals:\n', err || frenchMeals, '\n');
  });

  // Easy parallel queries: callback returns when all queries return or earlier if an error happened
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
```

## Using the underlying mongodb-native `Db` object 

The documentation of the mongodb-native `Db` object is [here][1].
To access and manipulate the underlying mongodb-native `Db` object,
there are 3 hooks on the mongo-lazy `db` object:

* `db.close()` to close the database
* `db.ready(listener)` to attach a listener which will be fired when `Db` is ready 
* `db.$` which is the mongodb-native `Db` object itself (or `null` when `Db` is not ready) 


## MIT License 

Copyright (c) 2012 Jie Meng-Gerard <contact@jie.fr>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[0]: http://mongodb.github.com/node-mongodb-native/api-generated/collection.html
[1]: http://mongodb.github.com/node-mongodb-native/api-generated/db.html