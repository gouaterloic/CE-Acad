const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const uf = require('../usefulFunctions/usefulFunctions');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction'); 
const Quiz = require('../models/Quiz');
const axios = require('axios')
const fetch = require('node-fetch')
// Dashboard Home Page
router.get('/', ensureAuthenticated, (req,res) => {
    res.render('dashboard',{
        username: req.user.username
    })
});

// Dashboard Profile Page
router.get('/profile', ensureAuthenticated, (req,res) => {
    const user = req.user;
    res.render('dashboard-profile',{user})
});

// Dashboard Profile Email Edit
router.post('/profile/edit-email', ensureAuthenticated, (req,res) => {
    // Values optained from user
    const {email, password} = req.body;
    // Validation
    let errors = [];
    // Check required fields
    if(!email || !password){
        errors.push({msg:'All fields are required'});
    }
    // Check Email Validity
    else if(!uf.isEmail(email)){
        errors.push({msg:'Enter valid Email address'});
    }
    if(errors.length > 0){
        res.render("dashboard-profile",{user:req.user,errors})
    } else{
         // Hash Password
         bcrypt.compare(password, req.user.password)
         .then((pass) => {
            if(pass){
                User.findOne({email:email})
                .then(user => {
                    if(user){
                        errors.push({msg:'Email Already exists'});
                        res.render('dashboard-profile',{user:req.user,errors})
                    }else{
                        User.updateOne(
                        {"email" : req.user.email},
                        {$set: { "email" : email}})
                        .then(user=>{
                            req.flash(
                                'success_msg',
                                'Email successfully changed'
                                );
                                res.redirect('/dashboard/profile')
                        })
                        
                    }
                })
            }else{
                errors.push({msg:'Incorrect password'});
                res.render('dashboard-profile',{user:req.user,errors})
            }
        })
        .catch((err) => {
            console.log(err)
        });
    }
});

// Dashboard Profile Username Edit
router.post('/profile/edit-username', ensureAuthenticated, (req,res) => {
    // Values optained from user
    const {username, password} = req.body;
    // Validation
    let errors = [];
    // Check required fields
    if(!username || !password){
        errors.push({msg:'All fields are required'});
    }
    if(errors.length > 0){
        res.render("dashboard-profile",{user:req.user,errors})
    } else{
         // Hash Password
         bcrypt.compare(password, req.user.password)
         .then((pass) => {
            if(pass){
                User.findOne({username:username})
                .then(user => {
                    if(user){
                        errors.push({msg:'Username Already exists'});
                        res.render('dashboard-profile',{user:req.user,errors})
                    }else{
                        User.updateOne(
                        {"username" : req.user.username},
                        {$set: { "username" : username}})
                        .then(user=>{
                            req.flash(
                                'success_msg',
                                'Username successfully changed'
                            );
                            res.redirect('/dashboard/profile')
                        })
                    }
                })
            }else{
                errors.push({msg:'Incorrect password'});
                res.render('dashboard-profile',{user:req.user,errors})
            }
        })
        .catch((err) => {
            console.log(err)
        });
    }
});

// Dashboard Profile Password Edit
router.post('/profile/edit-password', ensureAuthenticated, (req,res) => {
    // Values optained from user
    const {password,password1,password2} = req.body;
    // Validation
    let errors = [];
    // Check required fields
    if(!password || !password1 || !password2){
        errors.push({msg:'All fields are required'});
    }
    if(errors.length > 0){
        res.render("dashboard-profile",{user:req.user,errors})
    } else{
         // Validate current password
         bcrypt.compare(password, req.user.password)
         .then((pass) => {
            if(pass){
                if(password1.length<6){
                    errors.push({msg:'Password should be at least 6 characters'});
                    res.render('dashboard-profile',{user:req.user,errors})
                }else if(password1 !== password2){
                    errors.push({msg:'Passwords do not match'});
                    res.render('dashboard-profile',{user:req.user,errors})
                }else{
                    // Hash Password
                    bcrypt.genSalt(10,(err,salt)=>
                    bcrypt.hash(password1, salt, (err,hash)=>{
                        if(err) throw err;
                        User.updateOne(
                        {"email" : req.user.email},
                        {$set: { "password" : hash}})
                        .then(user=>{
                            req.flash(
                                'success_msg',
                                'Password successfully changed'
                            );
                            res.redirect('/dashboard/profile')
                        })
                        }))
                }      
            }else{
                errors.push({msg:'Incorrect password'});
                res.render('dashboard-profile',{user:req.user,errors})
            }
        })
        .catch((err) => {
            console.log(err)
        });
    }
});

// Dashboard Finance Page
router.get('/finance', ensureAuthenticated, (req,res) => {
    Transaction.find({id_user:req.user.id})
    .then(doc => {
        if(doc.length>0){
            res.render('dashboard-finance',{user:req.user,doc})
        }else{
            res.render('dashboard-finance',{user:req.user})
        }
        
    })
    
});

// Dashboard Finance Deposit
router.post('/finance/deposit', ensureAuthenticated, (req,res) => {
    const {amount,provider_id, account_number} = req.body;

    axios.post("https://api.dusupay.com/v1/collections",{
        api_key:"PUBK-119e4a961a37d9f097396433d65ea91d", 
        currency:"XAF", 
        amount:parseFloat(amount), 
        method:"MOBILE_MONEY", 
        provider_id, 
        account_number, 
        merchant_reference:parseInt(account_number).toString(36) + (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2),
        narration: `Deposit CE-Acad by ${req.user.username}`
    })
    .then(async respo=>{
        const response = await fetch('https://ce-acad.com/wc-api/WC_Dusupay_Webhook')
        const json = await response.json();
        console.log(json);
})
    .catch(err=>{
        console.log(err)
    }) 
}) 
// Dashboard Quiz Page
router.get('/quiz', ensureAuthenticated, (req,res) => {
    Quiz.find()
    .then(doc=>{
        const quiz = doc;
        res.render('dashboard-quiz',{user:req.user,quiz})
    })
});

//Dashboard Quiz Play
router.post('/quiz/take-quiz-now', ensureAuthenticated, (req,res) => {
    res.render("dashboard-quiz-play",{})
})

//Dashboard Quiz Register
router.post('/quiz/register', ensureAuthenticated, (req,res) => {
    bcrypt.compare(req.body.password, req.user.password)
    .then((pass) => {
        if (pass){
            if(req.user.revenue >= req.body.registration_fee){
                User.updateOne(
                    {"email" : req.user.email},
                    {$set: { "revenue" : req.user.revenue - req.body.registration_fee}},{ upsert: true })
                    .then(user=>{
                        Quiz.findOne({_id:req.body.id})
                        .then(quiz=>{
                            console.log(req.user.id)
                            quiz.registered_users.push(req.user.id)
                            Quiz.updateOne({_id:req.body.id},{$set:{registered_users:quiz.registered_users}},{ upsert: true })
                            .then(q=> {
                                res.redirect('/dashboard/quiz')
                            })
                        })
                    })
            }
        }
    })
})

module.exports = router;