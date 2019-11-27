const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

// Make the public folder static
app.use(express.static(__dirname + '/public'));

// Passport Config
require('./config/passport')(passport);

//DB Config
//const db = require('./config/keys').MongoURI;
const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB Connected.......'))
.catch(err => console.log(err))

// Use ejs layouts
app.use(expressLayouts);
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

// Launch server on PORT allocated
app.listen(process.env.PORT || 5000, console.log(`Server started on port ${process.env.PORT || 5000}`));