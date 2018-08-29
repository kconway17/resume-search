var express = require('express')
  , app = express()
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , server = require('http').createServer(app)
  , util = require('util')
  , db = require('./lib/resume_db.js')
  , ejs = require('ejs')
  , pdf = require('html-pdf')
  , nodemailer = require('nodemailer')

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
//
app.get('/resume',
  function (req, res) {
    res.redirect('/addresume.html');
  }
)

app.post('/resume', function(req, res){
       console.log("POST /resume");
       console.log( req.body );
       var resumeData = {};
	resumeData.user_name = req.body.user_name;
	resumeData.work_role = req.body.work_role;
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
        resumeData.executive_summary = req.body.executive_summary;
        resumeData.keywords = req.body.keywords;
        resumeData.education_degree = req.body.education_degree;
        resumeData.education_advanced_degree = req.body.education_advanced_degree;
        resumeData.tools_experience = req.body.tools_experience
        resumeData.certifications = []
        resumeData.trainings = []
        resumeData.role = []
       
          //adding all the information from the form to the certifications, trainings, and role arrays to be put into the database.
          if (Array.isArray(req.body.cert_description)) {
                 for (var i = 1; i < req.body.cert_description.length; i++) {
                        resumeData.certifications.push([req.body.cert_description[i], req.body.cert_month[i], req.body.cert_year[i]]);
                 }
          } else {
                 resumeData.certifications.push([req.body.cert_description, req.body.cert_month, req.body.cert_year]);
          }
       
          if (Array.isArray(req.body.training_description)) {
                 for (var i = 0; i < req.body.training_description.length; i++) {
                        resumeData.trainings.push([req.body.training_description[i], req.body.training_month[i], req.body.training_year[i]]);
                 }
          } else {
                 resumeData.trainings.push([req.body.training_description, req.body.training_month, req.body.training_year]);
          }
        
          if (Array.isArray(req.body.work_description)) {
                 for (var i = 0; i < req.body.work_description.length; i++) {
                        resumeData.role.push([req.body.work_description[i], req.body.work_from_year[i], req.body.work_to_year[i]]);
                 }
          } else {
                 resumeData.role.push([req.body.work_description, req.body.work_from_year, req.body.work_to_year]);
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
    res.redirect("/add.html");
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
       console.log(req.baseUrl)
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

app.post('/sendEmail', function(req, res) {
       var html;
       ejs.renderFile('views/resume.ejs', {info : req.body}, function(err, result) {
              if (result) {
                     html = result;
              }
              else {
                     console.log(err);
                     res.status(400).end();
              }
       });
       var options = { filename: 'resume.pdf', format: 'A4', base: 'file:///C:/Users/kconway/git/resume-search/public/', orientation: 'portrait', directory: '/public',type: "pdf" };
       pdf.create(html, options).toFile(function(err, res) {
           if (err) return console.log(err);
                console.log(res);
                //res.status(400).end();
           });
       //console.log(req.path);
    
              var transporter = nodemailer.createTransport({
                     service: 'outlook',
                     auth: {
                             user: 'kara.conway@pci-sm.com',
                             pass: 'PennyPiper9171!'
                         }
                     });   

              const mailOptions = {                        
                             from: 'kara.conway@pci-sm.com', // sender address
                             to: req.body.emails, // list of receivers
                             subject: 'Test PDF Email', // Subject line
                             html: '<p>Test 123</p>',// plain text body
                             attachments:[
                      {
                          filename:"resume.pdf",
                          path:"C:/Users/kconway/git/resume-search/resume.pdf"
                      }] 
                           };

              transporter.sendMail(mailOptions, function (err, info) {
                     if(err) {
                           //console.log(err);
                           console.log(err)
                           res.status(400).end();
                     }
                     else {
                           console.log(info);
                           res.status(200).end();
                     }
              })
})

 

//tells app to listen on port 8000
server.listen(8000);
console.log('[INFO] [app.js]  Resume Application listening on port 8000...');
