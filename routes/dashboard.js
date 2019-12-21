const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const uf = require('../usefulFunctions/usefulFunctions');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction'); 
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const axios = require('axios')
const fetch = require('node-fetch')
require("dotenv").config()


// Dashboard Home Page
router.get('/', ensureAuthenticated, (req,res) => {
    res.render('dashboard',{
        username: req.user.username
    })
});

// Dashboard Profile Page
router.get('/profile', ensureAuthenticated, (req,res) => {
    const user = req.user;
    if(user.affiliate != "admin@ce-acad.com"){
        User.findOne({_id:user.affiliate})
        .then(u=>{
        console.log(u.email)
        const ref = u.email;
        if (req.query.edit){
            res.render('dashboard-profile',{user,ref,edit:req.query.edit})
        }else{
            res.render('dashboard-profile',{user,ref})
        }
    })
    }else{
        if (req.query.edit){
            res.render('dashboard-profile',{user,edit:req.query.edit})
        }else{
            res.render('dashboard-profile',{user})
        }
    }
    
});

// Dashboard Profile Email Edit
router.post('/profile/edit-email', ensureAuthenticated, (req,res) => {
    // Values optained from user
    const {email, password} = req.body;
    const edit = "email";
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
        res.render("dashboard-profile",{user:req.user,errors,edit})
    } else{
         // Hash Password
         bcrypt.compare(password, req.user.password)
         .then((pass) => {
            if(pass){
                User.findOne({email:email})
                .then(user => {
                    if(user){
                        errors.push({msg:'Email Already exists'});
                        res.render('dashboard-profile',{user:req.user,errors,edit})
                    }else{
                        User.updateOne(
                        {"email" : req.user.email},
                        {$set: { "email" : email}})
                        .then(user=>{
                            req.flash(
                                'success_msg',
                                'Email successfully changed'
                                );
                                res.redirect('/dashboard/profile/?edit=' + edit)
                        })
                        
                    }
                })
            }else{
                errors.push({msg:'Incorrect password'});
                res.render('dashboard-profile',{user:req.user,errors,edit})
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
    const edit = "username";
    // Validation
    let errors = [];
    // Check required fields
    if(!username || !password){
        errors.push({msg:'All fields are required'});
    }
    if(errors.length > 0){
        res.render("dashboard-profile",{user:req.user,errors,edit})
    } else{
         // Hash Password
         bcrypt.compare(password, req.user.password)
         .then((pass) => {
            if(pass){
                User.findOne({username:username})
                .then(user => {
                    if(user){
                        errors.push({msg:'Username Already exists'});
                        res.render('dashboard-profile',{user:req.user,errors,edit})
                    }else{
                        User.updateOne(
                        {"username" : req.user.username},
                        {$set: { "username" : username}})
                        .then(user=>{
                            req.flash(
                                'success_msg',
                                'Username successfully changed'
                            );
                            res.redirect('/dashboard/profile/?edit=' + edit)
                        })
                    }
                })
            }else{
                errors.push({msg:'Incorrect password'});
                res.render('dashboard-profile',{user:req.user,errors,edit})
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
    const edit = "password";
    // Validation
    let errors = [];
    // Check required fields
    if(!password || !password1 || !password2){
        errors.push({msg:'All fields are required'});
    }
    if(errors.length > 0){
        res.render("dashboard-profile",{user:req.user,errors,edit})
    } else{
         // Validate current password
         bcrypt.compare(password, req.user.password)
         .then((pass) => {
            if(pass){
                if(password1.length<6){
                    errors.push({msg:'Password should be at least 6 characters'});
                    res.render('dashboard-profile',{user:req.user,errors,edit})
                }else if(password1 !== password2){
                    errors.push({msg:'Passwords do not match'});
                    res.render('dashboard-profile',{user:req.user,errors,edit})
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
                            res.redirect('/dashboard/profile/?edit=' + edit)
                        })
                        }))
                }      
            }else{
                errors.push({msg:'Incorrect password'});
                res.render('dashboard-profile',{user:req.user,errors,edit})
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
            if (req.query.edit){
                res.render('dashboard-finance',{user:req.user,doc,edit:req.query.edit})
            }else{
                res.render('dashboard-finance',{user:req.user,doc})
            }
        }else{
            if (req.query.edit){
                res.render('dashboard-finance',{user:req.user,edit:req.query.edit})
            }else{
                res.render('dashboard-finance',{user:req.user})
            }
        }
    })
    
});

// Dashboard Finance Get Transactions
router.get('/finance/get-transactions', ensureAuthenticated, (req,res) => {
    Transaction.find({$and:[{id_user:req.user.id},{status:"COMPLETED"}]})
    .then(docs=>{
        res.send(docs)
    })
    .catch(err=>console.log(err))
})

// Dashboard Finance Deposit
router.post('/finance/deposit', ensureAuthenticated, (req,res) => {
    const {amount,provider_id, account_number} = req.body;
    const edit = "deposit";

    axios.post("https://api.dusupay.com/v1/collections",{
        api_key: process.env.API_KEY, 
        currency:"XAF", 
        amount:parseFloat(amount), 
        method:"MOBILE_MONEY", 
        provider_id, 
        account_number, 
        merchant_reference:parseInt(account_number).toString(36) + (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2),
        narration: `Deposit CE-Acad by ${req.user.username}`
    })
    .then(respo=>{ 
        const data = respo.data.data;
        const newTrans = new Transaction({
            type: "deposit",
            amount: data.request_amount,
            fee: data.transaction_fee,
            currency: data.request_currency,
            provider: data.provider_id,
            momo_number: account_number,
            old_revenue: req.user.revenue,
            new_revenue: req.user.revenue,
            id_user: req.user.id,
            from_to: "You",
            dusu_ref: data.internal_reference,
            ref: data.merchant_reference
        })
        newTrans.save()
        .then(trans =>{
            req.flash(
                'success_msg',
                'Dial Mobile Money Code in your phone and confirm payment'
            );
            res.redirect('/dashboard/finance/?edit=' + edit)
        })
        .catch(err => console.log(err))
    })
    .catch(err =>{
        req.flash(
            'error_msg',
            err.response.data.message
        );
        res.redirect('/dashboard/finance/?edit=' + edit)
    })
}) 

//Dashboard Deposit Confirm
router.post('/finance/confirmOurWebhook', (req,res) => {
    const webhookHash = req.headers["webhook-hash"];
    const body = req.body;
    console.log(body)
    res.sendStatus(200);
})

// Dashboard Finance Withdraw
router.post('/finance/withdraw', ensureAuthenticated, (req,res) => {
    const {amount,provider_id, account_number} = req.body;
    const edit = "withdraw";
    if(!req.body.password){
        req.flash(
            'error_msg',
            'Enter your password'
        );
        res.redirect('/dashboard/finance/?edit=' + edit)
    }else{
        bcrypt.compare(req.body.password, req.user.password)
        .then((pass) => {
            if (pass){
                if (parseFloat(amount)+300 <= req.user.revenue){
                    axios.post("https://api.dusupay.com/v1/payouts",{
                        api_key: process.env.API_KEY, 
                        currency:"XAF", 
                        amount:parseFloat(amount), 
                        method:"MOBILE_MONEY", 
                        provider_id, 
                        account_number,
                        account_name:"CE-Acad", 
                        merchant_reference:parseInt(account_number).toString(36) + (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2),
                        narration: `Withdraw CE-Acad by ${req.user.username}`
                    },{headers: {
                        'secret-key': process.env.SECRET_KEY
                    }})
                    .then(respo=>{ 
                        const data = respo.data.data;
                        const newTrans = new Transaction({
                            type: "withdraw",
                            amount: -data.request_amount,
                            fee: -data.transaction_fee,
                            currency: data.request_currency,
                            provider: data.provider_id,
                            momo_number: account_number,
                            old_revenue: req.user.revenue,
                            new_revenue: req.user.revenue,
                            id_user: req.user.id,
                            from_to: "You",
                            dusu_ref: data.internal_reference,
                            ref: data.merchant_reference
                        })
                        newTrans.save()
                        .then(trans =>{
                            req.flash(
                                'success_msg',
                                'We are processing your transaction...'
                            );
                            res.redirect('/dashboard/finance/?edit=' + edit)
                        })
                        .catch(err => console.log(err))
                    })
                    .catch(err =>{
                        req.flash(
                            'error_msg',
                            err.response.data.message
                        );
                        res.redirect('/dashboard/finance/?edit=' + edit)
                    })
                }else if (isNaN(parseFloat(amount))) {
                    req.flash(
                        'error_msg',
                        'Enter Amount'
                    );
                    res.redirect('/dashboard/finance/?edit=' + edit)
                }else{
                    req.flash(
                        'error_msg',
                        'Make sure you have enough cash in your CE-Acad Account (including 300 FCFA for transaction fee)'
                    );
                    res.redirect('/dashboard/finance/?edit=' + edit)
                }
            }else{
                req.flash(
                    'error_msg',
                    'Wrong Password'
                );
                res.redirect('/dashboard/finance/?edit=' + edit)
            }
        })
    }
})

// Dashboard Quiz Page
router.get('/quiz', ensureAuthenticated, (req,res) => {
    Quiz.find()
    .then(doc=>{
        const quiz = doc;
        if (req.query.edit){
            res.render('dashboard-quiz',{user:req.user,quiz,edit:req.query.edit})
        }else{
            res.render('dashboard-quiz',{user:req.user,quiz})
        }
    })
    .catch(err=>console.log(err))
});

//Dashboard Quiz Play - Get Questions
router.get('/quiz/get-questions', ensureAuthenticated, (req,res) => {
    const {level, subject, topic} = req.query;
    if (topic !== "all"){
        if (level !== "all"){
            Question.find({$and:[{subject},{level},{topic}]})
            .then(doc => {
                res.send(doc)
            })
            .catch(err => console.log(err))
        }else{
            Question.find({$and:[{subject},{topic}]})
            .then(doc => {
                res.send(doc)
            })
            .catch(err => console.log(err))
        }
    }else if (level !== "all"){
        Question.find({$and:[{subject},{level}]})
        .then(doc => {
            res.send(doc)
        })
        .catch(err => console.log(err))
    }else{
        Question.find({subject})
        .then(doc => {
            res.send(doc)
        })
        .catch(err => console.log(err))
    }
})

// Dashboard Quiz - Get Results
router.get('/quiz/get-results', ensureAuthenticated, (req,res) => {
    const {quizID} = req.query;
    const user = req.user;
    Result.find({$and:[{quiz_id:quizID},{$or:[{player1_id:user.id},{player2_id:user.id},{player3_id:user.id},{player4_id:user.id}]}]})
    .then(docs=>{
        const results = [];
        var done = 0;
        docs.forEach(doc=>{
            // Player 1
            User.findOne({_id:doc.player1_id})
            .then(u=>{
                if (user.id == u.id){
                    doc.player1_id = "You";
                }else{
                    doc.player1_id = u.username;
                }
                done++
                if (done == docs.length*4){
                    res.send(docs);
                }
            })
            .catch(err=>console.log(err))

            // Player 2
            User.findOne({_id:doc.player2_id})
            .then(u=>{
                if (user.id == u.id){
                    doc.player2_id = "You";
                }else{
                    doc.player2_id = u.username;
                }
                done++
                if (done == docs.length*4){
                    res.send(docs);
                }
            })
            .catch(err=>console.log(err))

            // Player 3
            User.findOne({_id:doc.player3_id})
            .then(u=>{
                if (user.id == u.id){
                    doc.player3_id = "You";
                }else{
                    doc.player3_id = u.username;
                }
                done++
                if (done == docs.length*4){
                    res.send(docs);
                }
            })
            .catch(err=>console.log(err))

            // Player 4
            User.findOne({_id:doc.player4_id})
            .then(u=>{
                if (user.id == u.id){
                    doc.player4_id = "You";
                }else{
                    doc.player4_id = u.username;
                }
                done++
                if (done == docs.length*4){
                    res.send(docs);
                }
            })
            .catch(err=>console.log(err))
        })
    })
    .catch(err=>console.log(err))
})

// Dashboard Quiz Play - Results
router.post('/quiz/results', ensureAuthenticated, (req,res) => {
    const {totalPoints, quizID,numberOfQuestions} = req.body;
    const user = req.user;
    Quiz.findOne({_id:quizID})
    .then(quiz=>{
        // Save Results
        quiz.results.push([user.id,totalPoints]);
        // Remove Player from Registered Players
        quiz.registered_users.splice(quiz.registered_users.indexOf(user.id),1)
        // Add Player to Played Users
        quiz.played_users.push(user.id)
        // Current Partipants
        quiz.current_participants = quiz.played_users.length;
        // If Session over or not
        if(quiz.played_users.length==4){
            var pos = [];
            quiz.results.forEach((r,i)=>{
                if (i==0){
                    pos.push(r);
                }else{
                    for(var j = 0;j < pos.length;j++){
                        if (r[1]>pos[j][1]){
                            pos.splice(j,0,r);
                            break;
                        }else if(j==pos.length-1){
                            pos.push(r);
                            break;
                        }
                    }
                }
            })

            const newResult = new Result({
                quiz_id: quiz.id,
                round: quiz.round,
                total_points: numberOfQuestions,
                player1_id: pos[0][0],
                player1_points: pos[0][1],
                player2_id: pos[1][0],
                player2_points: pos[1][1],
                player3_id: pos[2][0],
                player3_points: pos[2][1],
                player4_id: pos[3][0],
                player4_points: pos[3][1]
            });
            newResult.save()
            .then(result => {
                quiz.played_users = [];
                quiz.current_participants =0;
                quiz.round += 1;
                quiz.results = [];
                quiz.save()
                .then(q=>{
                    res.send([{status:"200"}])
                })
                .catch(err=>console.log(err))
            })
            .catch(err=>console.log(err))
        }else{
            quiz.save()
            .then(q=>{
                res.send([{status:"200"}])
            })
            .catch(err=>console.log(err))
        }
        
    })
    .catch(err=>console.log(err))
})


//Dashboard Quiz Register
router.post('/quiz/register', ensureAuthenticated, (req,res) => {
    const edit = req.body.id;
    if(!req.body.password){
        req.flash(
            'error_msg',
            'Enter your password'
        );
        res.redirect('/dashboard/quiz/?edit=' + edit)
    }else{
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
                                    
                                    req.flash(
                                        'success_msg',
                                        'Registration Successful'
                                    );
                                    res.redirect('/dashboard/quiz/?edit=' + edit)
                                })
                            })
                        })
                }else{
                    req.flash(
                        'error_msg',
                        'Not Enough Cash in your CE-Acad Account. Please go to the Finance Menu and Deposit Cash.'
                    );
                    res.redirect('/dashboard/quiz/?edit=' + edit)
                }
            }else{
                req.flash(
                    'error_msg',
                    'Wrong Password'
                );
                res.redirect('/dashboard/quiz/?edit=' + edit)
            }
        })
    }
    
})

module.exports = router;