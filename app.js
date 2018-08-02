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
 
	 var resumeData = {};

	 resumeData.user_name = req.body.user_name;
	   resumeData.work_role = req.body['Work Role'];
	   resumeData.clearance = req.body.clearance;
	   resumeData.clearance_1_month = req.body.clearance_1_month;
	   resumeData.clearance_1_year = req.body.clearance_1_year;
	   resumeData.company = req.body.Company;
	   resumeData.degree = req.body.Degree;
	   resumeData.advanced_degree = req.body['Advanced Degree'];
	   resumeData.experience = req.body.Experience;
	   resumeData.technical = req.body.Technical;
	   resumeData.degree_field = req.body.degree_field;
	   resumeData.advanced_degree_field = req.body.advanced_degree_field;
	   //resumeData.cert_1_description = req.body.cert_1_description;
	   // resumeData.cert_1_month = req.body.cert_1_month;
	   //resumeData.cert_1_year = req.body.cert_1_year;
	   resumeData.training = req.body.Training;
	   resumeData.training_1_month = req.body.training_1_month;
	   resumeData.training_1_year = req.body.training_1_year;
	   resumeData.executive_summary = req.body.executive_summary;
	   resumeData.work_1_from_year = req.body.work_1_from_year;
	   resumeData.work_1_description = req.body.work_1_description;
	   resumeData.work_1_to_year = req.body.work_1_to_year;
	   resumeData.tools_experience = req.body['Tools Experience'];
	   resumeData.keywords = req.body.keywords;
	  resumeData.education_degree = req.body.education_degree;
	  resumeData.education_advanced_degree = req.body.education_advanced_degree;

	 
		//create the array
		   resumeData.certifications = []
		   //start an index counter at 1
		   var index = 1;
		   while(index<10){
			 //if there is a description we'll add to the array
		       var description = req.body["cert_"+index+"_description"];
		       if(!description){
		           //break loop if there is no description
		           break;
		       }else{
		          //build a string that looks like "Secret  12/1998"
		          var cert = req.body["cert_"+index+"_description"]
		          cert = cert + "  ";
		          cert = cert + req.body["cert_"+index+"_month"]
		          cert = cert + "/";
		          cert = cert + req.body["cert_"+index+"_year"];
		          //Add the final string to the certifications array, need
		          //to use index-1 as the array position since arrays are
		          //zero indexed
		          resumeData.certifications[index-1] = cert;
		       }
		       //increment the index one value
		       index = index + 1;
		   }
		   // Saving the new user to DB is JSON format
		   db.saveResume(resumeData, function(err, saved){
		 	  
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
if(req.body.work_role) {
		searchCriteria["work_role"] = req.body.work_role;
}
if(req.body.clearance != ""){
		searchCriteria["clearance"] = req.body.clearance;
} 
if(req.body.tools_experience != ""){
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

