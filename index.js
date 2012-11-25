var mongo = require('mongodb');

exports.open = function(a, b, c) {
    
  var COLLECTION = {};
  var DB_READY_LISTENERS = [];
  var DB, ERROR_CALLBACK;
  
  //============================================================================
  function addDbReadyListener(cb) {
    DB || DB_READY_LISTENERS.push(cb);
  }
  
  //============================================================================
  function closeDb() {
    DB && DB.close();
  }  
  
  //============================================================================
  function dbReady(err, db) {
    var i, listener, coll;
    if (err) {
      ERROR_CALLBACK(err);
    } else {
      DB = db;    
      for (i = 0; listener = DB_READY_LISTENERS[i]; i++)
        listener(db);
      for (coll in COLLECTION)
        db.collection(coll, collectionReady);
    }
  }
  
  //============================================================================  
  function collectionReady(err, collection) {
    var i, request, pendingRequests, collectionWrapper;
    if (err) {
      ERROR_CALLBACK(err);
    } else {
      collectionWrapper = COLLECTION[collection.collectionName];
      collectionWrapper.connection = collection;
      pendingRequests = collectionWrapper.pendingRequests;
      COLLECTION[collection.collectionName] = collection;
      for (i = 0; request = pendingRequests[i]; i++)
        collection[request.method].apply(collection, request.arguments);
    }
  }
  
  //============================================================================  
  function get(_, attr) {
    if (attr === '$')
      return DB;
    if (attr === 'close')
      return closeDb;
    if (attr === 'ready')
      return addDbReadyListener;
    if (COLLECTION[attr])
      return COLLECTION[attr];
    COLLECTION[attr] = new Collection();    
    if (DB)
      DB.collection(attr, collectionReady);
    return COLLECTION[attr];      
  }  
  
  //============================================================================
  function parallel(queries, callback) {
    var general = {results: [], callback: callback, countdown: 0};
    var i, query, coll, method; 
    for (i = 0; query = queries[i]; i++) {        
      coll = get(null, query.shift());
      method = query.shift();
      if (typeof coll[method] === 'function') {      
        query.push(createCallback(i, general));
        general.countdown++;
        coll[method].apply(coll, query);
      } else {
        callback(new Error('Invalid db method "' + method + '"'));
        delete general.callback;
      }
    }  
  }  
  
  //============================================================================  
  if (typeof a === 'string') {
    DB = new mongo.Db(a, b, c);
    ERROR_CALLBACK = c ? c.error || console.log : console.log;
    DB.open(dbReady);
  } else  {
    a || (a = {});
    ERROR_CALLBACK = a.error || console.log;
    mongo.connect('mongodb://' 
      + (a.user && a.password ? a.user + ':' + a.password + '@' : '')
      + (a.host || 'localhost') + ':' + (a.port || 27017) + '/'
      + (a.database || a.db || ''), 
      dbReady
    );
  }
  
  //============================================================================
  if (!global.Proxy)
    throw new Error('run node with harmony: "node --harmony yourScript.js"')
  
  return Proxy.createFunction({get: get}, parallel);
  
}

//==============================================================================
function Collection() {  
  this.pendingRequests = [];  
}

//==============================================================================
function wrapper(method) {
  return function() {
    return this.connection ?
      this.connection[method].apply(this.connection, arguments) :
      this.pendingRequests.push({method: method, arguments: arguments});
  }
}

//==============================================================================
function createCallback(index, general) {
  return function(err, x) {        
    if (err) {
      general.callback(err);
      delete general.callback;
    } else {
      general.results[index + 1] = x;
      if (general.callback && --general.countdown <= 0) {        
        general.callback.apply(null, general.results);
        delete general.callback;
      }        
    }    
  }
}

//==============================================================================
function init() {
  var x;
  for (x in mongo)
    exports[x] = mongo[x];
  for (x in mongo.Collection.prototype)
    if (typeof mongo.Collection.prototype[x] === 'function')
      Collection.prototype[x] = wrapper(x);  
}

//==============================================================================
mongo.Collection.prototype.findAll = function() {
  var callback = Array.prototype.pop.call(arguments);
  this.find.apply(this, arguments).toArray(callback);
}

//==============================================================================
init();