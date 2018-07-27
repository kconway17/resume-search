var express = require('express')
  , app = express()
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , server = require('http').createServer(app)
  , util = require('util')
  , db = require('./lib/resume_db.js')
  


app.use(express.static('public'));
app.use(cookieParser());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');


// set up the RethinkDB database
db.setup();

// redirects '/' to searchpage2.html
app.get('/', 
  function (req, res) {
    res.redirect('/searchpage2.html');
  }
)

//redirects '/resume' to addResume.html
app.get('/resume', 
  function (req, res) {
    res.redirect('/addResume.html');
  }
)


 app.post('/resume', function(req, res){
	console.log("POST /resume");
	console.log( req.body );
 
	
  // Saving the new user to DB is JSON format
  db.saveResume({
      user_name: req.body.user_name,
      work_role: req.body['Work Role'],
	  clearance: req.body.clearance,
	  clearance_1_month: req.body.clearance_1_month,
	  clearance_1_year: req.body.clearance_1_year,
	  company: req.body.Company,
	  degree: req.body.Degree,
	  advanced_degree: req.body['Advanced Degree'],
	  experience: req.body.Experience,
	  technical: req.body.Technical,
	  degree_field: req.body.degree_field,
	  advanced_degree_field: req.body.advanced_degree_field,
	  certification: req.body.Certification,
	  cert_1_month: req.body.cert_1_month,
	  cert_1_year: req.body.cert_1_year,
	  training: req.body.Training,
	  training_1_month: req.body.training_1_month,
	  training_1_year: req.body.training_1_year,
	  executive_summary: req.body.executive_summary,
	  work_1_from_year: req.body.work_1_from_year,
	  work_1_description: req.body.work_1_description,
	  work_1_to_year: req.body.work_1_to_year,
	  tools_experience: req.body['Tools Experience'],
	  keywords: req.body.keywords
    },
    function(err, saved) {
      console.log("[DEBUG][/resume][saveResume] %s", saved);
      if(err) {
        req.write('<h1>ERROR</h1> <p>There was an error creating the account. Please try again later</p>');
        res.write('<a href="/resume">Add Resume</a>');
		res.end();
        return
      }
      if(saved) {
        console.log("[DEBUG][/resume][saveResume] /");
        res.write('<h1>SUCCESS</h1> <p>Resume Was Stored</p>');
        res.write('<a href="/resume">Add Resume</a>');
        res.end();
      }
      else {
        console.log("[ERROR][/resume][saveResume] /");
        res.write('<h1>ERROR</h1> <p>Resume Was NOT Stored</p>');
        res.write();
        res.write('<a href="/resume">Add Resume</a>');
        res.end();
      }
      return
    }
  );
});


app.post('/search_resume', function(req, res){
	console.log("POST /search_resume");
	console.log( req.body );

	
var searchCriteria = {};
if(req.body.work_role != "" && req.body.clearance != "" && req.body.tools_experience != ""){
	searchCriteria["work_role"] = req.body.work_role;
	searchCriteria["clearance"] = req.body.clearance;
	searchCriteria["tools_experience"] = req.body.tools_experience;
}


db.search(searchCriteria,
	function(err, cursor){
		if(err){
			return next(err);
		}

//retrive all resumes in array and display on the webpage 
cursor.toArray(function(err, result){
	console.log("[DEBUG][/search][cursor.toArray]err: "+err);
	console.log("[DEBUG][/search][cursor.toArray]result: " + result);
	if(err){
		res.write('<h1>FAILURE</h1> <p>Search Returned Error</p>');
		res.write('Error: ' + err.name + 'with message: ' + err.message);
	}else{
		res.render('search_resume', {info: result});
		

res.end();
	}
});
});
});

app.get('/info/:id', function(req, res){
	var searchCriteria = {};
	searchCriteria["id"] = req.params.id;
	db.search(searchCriteria, 
		function(err, cursor){
			if(err){
				return next(err);
			}
			else{
				cursor.toArray(function(err, result){
					if(err){
						res.write('<h1>FAILURE</h1> <p>Search Returned Error</p>');
						res.write('Error: ' + err.name + 'with message: ' + err.message);
					}
					else{
						console.log(result);
						res.render('info', {info: result[0]});
						res.end();
						
					}
				
				});

			}
		});
});

//tells app to listen on port 8000
server.listen(8000);
console.log('[INFO] [app.js]  Resume Application listening on port 8000...');

