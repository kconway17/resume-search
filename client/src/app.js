var async = require('async');
var express = require('express');
var bodyParser = require('body-parser');
var r = require('rethinkdb');

var config = require(__dirname + './config.js');

var app = express();


//For serving the index.html and all the other front-end assets.
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());

//The REST routes for "resumes".
app.route('/resumes')
  .get(listAllResumes)
  .post(createResume);

app.route('/resumes/:id')node
  .get(getResumeItem)
  .put(updateResumeItem)
  .delete(deleteResumeItem);

//If we reach this middleware the route could not be handled and must be unknown.
app.use(handle404);

//Generic error handling middleware.
app.use(handleError);


/*
 * Retrieve all resume items.
 */
function listAllResumes(req, res, next) {
  r.table('resumes').orderBy({index: 'createdAt'}).run(req.app._rdbConn, function(err, cursor) {
    if(err) {
      return next(err);
    }

    //Retrieve all the resumes in an array.
    cursor.toArray(function(err, result) {
      if(err) {
        return next(err);
      }

      res.json(result);
    });
  });
}

/*
 * Insert a new resume item.
 */
function createResume(req, res, next) {
  var resumeItem = req.body;
  resumeItem.createdAt = r.now();

  console.dir(resumeItem);

  r.table('resumes').insert(resumeItem, {returnChanges: true}).run(req.app._rdbConn, function(err, result) {
    if(err) {
      return next(err);
    }

    res.json(result.changes[0].new_val);
  });
}

/*
 * Get a specific resume item.
 */
function getResumeItem(req, res, next) {
  var resumeItemID = req.params.id;

  r.table('resumes').get(reusmeItemID).run(req.app._rdbConn, function(err, result) {
    if(err) {
      return next(err);
    }

    res.json(result);
  });
}

/*
 * Update a resume item.
 */
function updateResumeItem(req, res, next) {
  var resumeItem = req.body;
  var resumeItemID = req.params.id;

  r.table('resumes').get(resumeItemID).update(resumeItem, {returnChanges: true}).run(req.app._rdbConn, function(err, result) {
    if(err) {
      return next(err);
    }

    res.json(result.changes[0].new_val);
  });
}

/*
 * Delete a resume item.
 */
function deleteResumeItem(req, res, next) {
  var resumeItemID = req.params.id;

  r.table('resumes').get(resumeItemID).delete().run(req.app._rdbConn, function(err, result) {
    if(err) {
      return next(err);
    }

    res.json({success: true});
  });
}

/*
 * Page-not-found middleware.
 */
function handle404(req, res, next) {
  res.status(404).end('not found');
}

/*
 * Generic error handling middleware.
 * Send back a 500 page and log the error to the console.
 */
function handleError(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({err: err.message});
}

/*
 * Store the db connection and start listening on a port.
 */
function startExpress(connection) {
  app._rdbConn = connection;
  app.listen(config.express.port);
  console.log('Listening on port ' + config.express.port);
}

/*
 * Connect to rethinkdb, create the needed tables/indexes and then start express.
 * Create tables/indexes then start express
 */
async.waterfall([
  function connect(callback) {
    r.connect(config.rethinkdb, callback);
  },
  function createDatabase(connection, callback) {
    //Create the database if needed.
    r.dbList().contains(config.rethinkdb.db).do(function(containsDb) {
      return r.branch(
        containsDb,
        {created: 0},
        r.dbCreate(config.rethinkdb.db)
      );
    }).run(connection, function(err) {
      callback(err, connection);
    });
  },
  function createTable(connection, callback) {
    //Create the table if needed.
    r.tableList().contains('resumes').do(function(containsTable) {
      return r.branch(
        containsTable,
        {created: 0},
        r.tableCreate('resumes')
      );
    }).run(connection, function(err) {
      callback(err, connection);
    });
  },
  function createIndex(connection, callback) {
    //Create the index if needed.
    r.table('resumes').indexList().contains('createdAt').do(function(hasIndex) {
      return r.branch(
        hasIndex,
        {created: 0},
        r.table('resumes').indexCreate('createdAt')
      );
    }).run(connection, function(err) {
      callback(err, connection);
    });
  },
  function waitForIndex(connection, callback) {
    //Wait for the index to be ready.
    r.table('resumes').indexWait('createdAt').run(connection, function(err, result) {
      callback(err, connection);
    });
  }
], function(err, connection) {
  if(err) {
    console.error(err);
    process.exit(1);
    return;
  }

  startExpress(connection);
});