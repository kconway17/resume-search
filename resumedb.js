
r = require('rethinkdb');

/*
 * this function is called each time the program needs a connection
 * to the RethinkDB
 */

function getConnection(){
  var connection = null;
  r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
      if (err) throw err;
      connection = conn;
  })
}

/*
 * the data parameter would be JSON formatted resume data passed in
 * to this function from the express web server code
 */
function addResumeData( data ){
    var connection = getConnection();
    r.table('resumes').insert( data ).run(connection, function(err, result){
        if(err) throw err;
        console.log(JSON.stringify(result, null, 2);
    })
}

/*
 *  retrieve a single resume from the database using the
 * identifier key for the resume
 */
/*function getResumeData ( resumeId ){
  //get a connection
  var connection = getConnection();
  //search for the resume data
      //if not found, return an err or and empty result
 r.table('resumes')
  //format it into a JSON formatted stringify
 
  //return the value
 

}


 * search resume database and return a JSON formatted array of resume
 * data.  'searchCriteria' is a key-value pair of search parameters
 *  e.g. "work role", "Software Engineer"

function searchResumeData ( searchCriteria ){
  //get a connection
  var connection = getConection();
  //execute a search
 
  //make sure it's in JSON format
 
  //return the search results
*/
}