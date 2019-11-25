const express = require('express');
const router = express.Router();
const uf = require('../usefulFunctions/usefulFunctions');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { forwardAuthenticated } = require('../config/auth');

router.get('/', forwardAuthenticated, (req, res) => res.redirect('/'));

router.post('/', function(req,res){
    // Values optained from user
    const {username, email, password, password2} = req.body;
    let str = 'signUp';
    // Validation
    let errors = [];
    // Check required fields
    if(!username || !email || !password || !password2){
        errors.push({msg:'All fields are required'});
    }
    // Check passwords match
    else if (password !== password2){
        errors.push({msg:'Passwords do not match'});
    }
    // Check pass length
    else if(password.length<6){
        errors.push({msg:'Password should be at least 6 characters'});
    }
    // Check Email Validity
    else if(!uf.isEmail(email)){
        errors.push({msg:'Enter valid Email address'});
    }

    if(errors.length > 0){
        res.render('home',{errors,username,email,password,password2,str});
    } else{
       User.findOne({$or:[{username:username},{email:email}]})
       .then(user=>{
           if(user){
            errors.push({msg:'Username or Email Already exists'});
            res.render('home',{errors,username,email,password,password2,str});
           }else{
            const newUser = new User({username,email,password});
            // Hash Password
            bcrypt.genSalt(10,(err,salt)=>
                bcrypt.hash(password, salt, (err,hash)=>{
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save()
                    .then(user => {
                        req.flash(
                            'success_msg',
                            'You are now registered and can Sign in'
                          );
                        res.redirect('/')
                    })
                    .catch(err=> console.log(err));
                    }))
           }
       })

    }

}); 

module.exports = router;