/**
 * To query the database  we are using 
 * [`filter`](https://rethinkdb.com/api/javascript/filter/). 
 *
 * A 'filter` op returns an object specifying the number
 * of successfully queried objects
 *
 *
 * @param {Object} item
 *    The item to be searched
 *
 * @param {Function} callback2
 *    callback invoked once after the first result returned
 *
 * @returns {Boolean} `true` if the search was successful, `false` otherwise 
 */

module.exports.saveResume = function (item, callback2) {


  onConnect(function (err, connection) {
    r.table('resumes').filter('item').run(connection, function(err, result) {
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



app.post('/search_resume', function(req, res){
	console.log("POST /search_resume");
	console.log(req.body);
}
	
        
        app.post('/resume', function(req, res){
	console.log("POST /resume");
	console.log(req.body );
