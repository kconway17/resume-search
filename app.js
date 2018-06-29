var express = require('express')
  , app = express()
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , server = require('http').createServer(app)
  , util = require('util')
  , db = require('./lib/resume_db.js');

app.use(express.static('public'));
app.use(cookieParser());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// set up the RethinkDB database
db.setup();


app.get('/', 
  function (req, res) {
    res.redirect('/addResume.html');
  }
)

app.get('/resume', 
  function (req, res) {
    res.redirect('/addResume.html');
  }
)

 app.post('/resume', function(req, res){
	console.log("POST /resume");
	console.log( req.body );
	
	
app.post('/search_resume', function(req, res){
	console.log("POST /search_resume");
	console.log( req.body );
})


		
  // Saving the new user to DB
  db.saveResume({
      user_name: req.body.username,
      work_role: req.body['Work Role'],
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
	  work_history: req.body['Work History'],
	  work_1_from_month: req.body.work_1_from_month,
	  work_1_from_year: req.body.work_1_from_year,
	  work_1_description: req.body.work_1_description,
	  work_1_to_month: req.body.work_1_to_month,
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




server.listen(8000);
console.log('[INFO] [app.js]  Resume Application listening on port 8000...');