var r = require('rethinkdb')
  , util = require('util')
  , assert = require('assert');

  
  
//  resume CRUD functions  

/**
 * To save a new resume using we are using 
 * [`insert`](http://www.rethinkdb.com/api/javascript/insert/). 
 *
 * An `insert` op returns an object specifying the number
 * of successfully created objects and their corresponding IDs:
 *
 * ```
 * {
 *   "inserted": 1,
 *   "errors": 0,
 *   "generated_keys": [
 *     "b3426201-9992-ab84-4a21-576719746036"
 *   ]
 * }
 * ```
 *
 * @param {Object} resume
 *    The resume to be saved
 *
 * @param {Function} callback
 *    callback invoked once after the first result returned
 *
 * @returns {Boolean} `true` if the resume was created, `false` otherwise 
 */
module.exports.saveResume = function (resume, callback) {


  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('resume').insert(resume).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][saveResume] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if(result.inserted === 1) {
          callback(null, true);
        }
        else {
          callback(null, false);
        }
      }
      connection.close();
    });
  });
};  
  
  
  
  

// #### Connection details

// RethinkDB database settings. Defaults can be overridden using environment variables.
var dbConfig = {
  host: 'localhost',
  port:  28015,
  db  : 'resumes',
  tables: {
    'resume': 'id'
  }
};

/**
 * A wrapper function for the RethinkDB API `r.connect`
 * to keep the configuration details in a single function
 * and fail fast in case of a connection error.
 */ 
function onConnect(callback) {
  r.connect({host: dbConfig.host, port: dbConfig.port }, function(err, connection) {
    assert.ok(err === null, err);
    connection['_id'] = Math.floor(Math.random()*10001);
    callback(err, connection);
  });
}

/**
 * Connect to RethinkDB instance and perform a basic database setup:
 *
 * - create the `RDB_DB` database (defaults to `resumes`)
 * - create tables `resume` in this database
 */
module.exports.setup = function() {
  console.log("[INFO] [resume_db.js] In Database Setup Function");
  
  console.log("[INFO] [resume_db.js] Connecting to database '%s' on port '%s' ...", dbConfig.db, dbConfig.port);
  r.connect({host: dbConfig.host, port: dbConfig.port }, function (err, connection) {
    assert.ok(err === null, err);
	
	//Create the database if needed, will fail if already exists
	console.log("[INFO] [resume_db.js] Attempting to create RethinkDB '%s'...", dbConfig.db);
    r.dbCreate(dbConfig.db).run(connection, function(err, result) {
      if(err) {
        console.log("[INFO] [resume_db.js] RethinkDB database '%s' already exists.", dbConfig.db);
      }
      else {
        console.log("[INFO] [resume_db.js] RethinkDB database '%s' created", dbConfig.db);
      }

	  //create any tables defined in dbConfig.  Will fail if already exists
      for(var tbl in dbConfig.tables) {
        (function (tableName) {
			
		  console.log("[INFO] [resume_db.js] Attempting to create RethinkDB Table '%s'...", tableName);
          r.db(dbConfig.db).tableCreate(tableName, {primaryKey: dbConfig.tables[tbl]}).run(connection, function(err, result) {
            if(err) {
              console.log("[INFO] [resume_db.js] RethinkDB table '%s' already exists.", tableName);
            }
            else {
              console.log("[INFO ] RethinkDB table '%s' created", tableName);
            }
          });
        })(tbl);
      }
    });
  });
};