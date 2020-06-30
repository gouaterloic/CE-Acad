const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const axios = require('axios')

// parse application/json
app.use(bodyParser.json())

// Make the public folder static
app.use(express.static(__dirname + '/public'));

// Passport Config
require('./config/passport')(passport);

//DB Config
const db = require('./config/keys').MongoURI;
//const db = require('./config/keys').mongoUrl;

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB Connected.......'))
.catch(err => console.log(err))

// // Use ejs layouts
// app.use(expressLayouts);

// Use ejs as view engine
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(session({
    secret: 'supercalifragilisticexpialidociousz',
    resave:true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});



// Routes
app.use('/',require('./routes/index'));
app.use('/signin',require('./routes/sign-in'));
app.use('/signup',require('./routes/sign-up'));
app.use('/signout',require('./routes/sign-out'));
app.use('/dashboard',require('./routes/dashboard'));
app.use('/admin',require('./routes/admin'));

// Run code at midnight
schedule.scheduleJob({hour: 22, minute: 58}, ()=>{
  axios.post("https://ce-acad.com/dashboard/quiz/session-expired-results",{
        totalPoints: 50, 
        quizID:'5e18e7621c9d440000fedbe1', 
        numberOfQuestions:50,
        role: "admin"
    })
    .then(respo=>{
      console.log('Completed')
    })
    .catch(err=>console.log(err))
})

// Launch server on PORT allocated
app.listen(process.env.PORT || 5000, console.log(`Server started on port ${process.env.PORT || 5000}`));