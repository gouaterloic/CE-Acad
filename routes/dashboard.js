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
const bodyParser = require('body-parser');
require("dotenv").config()


// Dashboard Home Page
router.get('/', ensureAuthenticated, (req,res) => {
    res.render('dashboard',{
        user: req.user
    })
});

// Dashboard Profile Page
router.get('/profile', ensureAuthenticated, (req,res) => {
    const user = req.user;
        User.findOne({_id:user.affiliate})
        .then(u=>{
        const ref = u.email;
        if (ref != "admin@ce-acad.com"){
            if (req.query.edit){
                res.render('dashboard-profile',{user,ref,edit:req.query.edit})
            }else{
                res.render('dashboard-profile',{user,ref})
            }
        }else{
            if (req.query.edit){
                res.render('dashboard-profile',{user,edit:req.query.edit})
            }else{
                res.render('dashboard-profile',{user})
            }
        }
    })
    
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
                        {$set: { "username" : username, "referrer_link":`https://ce-acad.com?referrer=${username.split(" ").join("-").toLowerCase()}`}})
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
    var done = 0;
    if (req.user.email == "admin@ce-acad.com"){
        Transaction.find()
        .then(docs=>{
            docs.forEach(doc=>{
                User.findOne({_id:doc.from_to})
                .then(u=>{
                    doc.from_to = u.username;
                    done++
                    if(done==docs.length){
                        res.send(docs)
                    }
                })
            })
        })
        .catch(err=>console.log(err))
    }else{
        Transaction.find({$and:[{id_user:req.user.id},{status:"COMPLETED"}]})
        .then(docs=>{
            docs.forEach(doc=>{
                User.findOne({_id:doc.from_to})
                .then(u=>{
                    if(u.username == req.user.username){
                        doc.from_to = "You";
                    }else{
                        doc.from_to = u.username;
                    }
                    done++
                    if(done==docs.length){
                        res.send(docs)
                    }
                })
            })
        })
        .catch(err=>console.log(err))
    }
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
            new_revenue: req.user.revenue + data.request_amount,
            id_user: req.user.id,
            from_to: req.user.id,
            dusu_ref: data.internal_reference,
            ref: data.merchant_reference,
            status: "PENDING"
        })
        newTrans.save()
        .then(trans =>{
            req.flash(
                'success_msg',
                'Dial *126# in your phone and confirm payment. Refresh the page after payment completion, and your deposit should be updated'
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
router.post('/finance/completed-deposits-and-withdrawals', (req,res) => {
    const webhookHash = req.headers["webhook-hash"];
    const data = req.body;
    if (webhookHash == "ComprtitiveExaminationAcademe"){
        if (data.transaction_type == "collection"){
            Transaction.findOne({dusu_ref:data.internal_reference})
            .then(t=>{
                if(data.transaction_status == "COMPLETED"){
                    Transaction.updateOne({_id:t.id},{$set:{status:"COMPLETED"}})
                    .then(r=>{
                        // Update CE-Acad Account
                        User.findOne({_id:t.id_user})
                        .then(u=>{
                            User.updateOne({_id:u.id},{$set:{revenue: u.revenue + data.total_credit}})
                            .then(user=>{
                                res.status(200);
                                res.send();
                            })
                            .catch(err=>console.log(err))
                        })
                        .catch(err=>console.log(err))
                    })
                    .catch(err=>console.log(err))
                }else{
                    Transaction.deleteOne({_id:t.id})
                    .then(r =>{
                        res.status(200);
                        res.send();
                    })
                    .catch(err=>console.log(err))
                }
            })
            .catch(err=>console.log(err))
        }else if (data.transaction_type == "payout"){
            Transaction.findOne({dusu_ref:data.internal_reference})
            .then(t=>{
                if(data.transaction_status == "COMPLETED"){
                    Transaction.updateOne({_id:t.id},{$set:{status:"COMPLETED"}})
                    .then(r=>{
                        res.status(200);
                        res.send();
                    })
                    .catch(err=>console.log(err))
                }else{
                    Transaction.deleteOne({_id:t.id})
                    .then(r =>{
                        // Update CE-Acad Account
                        User.findOne({_id:t.id_user})
                        .then(u=>{
                            User.updateOne({_id:u.id},{$set:{revenue: u.revenue + data.total_debit}})
                            .then(user=>{
                                res.status(200);
                                res.send();
                            })
                            .catch(err=>console.log(err))
                        })
                        .catch(err=>console.log(err))
                    })
                    .catch(err=>console.log(err))
                }
            })
            .catch(err=>console.log(err))
        }else{
            console.log(req.body)
            res.status(200);
            res.send();
        }
    }
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
                            new_revenue: req.user.revenue-data.request_amount-data.transaction_fee,
                            id_user: req.user.id,
                            from_to: req.user.id,
                            dusu_ref: data.internal_reference,
                            ref: data.merchant_reference,
                            status: "PENDING"
                        })
                        newTrans.save()
                        .then(t =>{
                            // Update CE-Acad Account
                            User.findOne({_id:t.id_user})
                            .then(u=>{
                                User.updateOne({_id:u.id},{$set:{revenue: u.revenue - data.total_debit}})
                                .then(user=>{
                                    req.flash(
                                        'success_msg',
                                        'We are processing your transaction... You should receive the money into your MoMo in few seconds'
                                    );
                                    res.redirect('/dashboard/finance/?edit=' + edit)
                                })
                                .catch(err=>console.log(err))
                            })
                            .catch(err=>console.log(err))
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
    Quiz.find({winning_price:0})
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
    var randomIndex;
    const questions = [];
    if (topic !== "all"){
        if (level !== "all"){
            Question.find({$and:[{subject},{level},{topic}]})
            .then(doc => {
                for(var i=0;i<50;i++){
                    randomIndex = Math.floor(Math.random() * doc.length);
                    questions.push(doc[randomIndex])
                    doc.splice(randomIndex,1)
                }
                res.send(questions)
            })
            .catch(err => console.log(err))
        }else{
            Question.find({$and:[{subject},{topic}]})
            .then(doc => {
                for(var i=0;i<50;i++){
                    randomIndex = Math.floor(Math.random() * doc.length);
                    questions.push(doc[randomIndex])
                    doc.splice(randomIndex,1)
                }
                res.send(questions)
            })
            .catch(err => console.log(err))
        }
    }else if (level !== "all"){
        Question.find({$and:[{subject},{level}]})
        .then(doc => {
            for(var i=0;i<50;i++){
                randomIndex = Math.floor(Math.random() * doc.length);
                questions.push(doc[randomIndex])
                doc.splice(randomIndex,1)
            }
            res.send(questions)
        })
        .catch(err => console.log(err))
    }else{
        Question.find({subject})
        .then(doc => {
            for(var i=0;i<50;i++){
                randomIndex = Math.floor(Math.random() * doc.length);
                questions.push(doc[randomIndex])
                doc.splice(randomIndex,1)
            }
            res.send(questions)
        })
        .catch(err => console.log(err))
    }
})

// Dashboard Quiz - Get Results
router.get('/quiz/get-results', ensureAuthenticated, (req,res) => {
    const {quizID} = req.query;
    const user = req.user;
    if (user.email != "admin@ce-acad.com"){
        Result.find({$and:[{quiz_id:quizID},{players_id:{$in:[user.id]}}]})
        .then(docs=>{
            const results = [];
            var done = 0;
            var donef = 0;
            docs.forEach(doc=>{
                donef += doc.players_id.length;
            })
            docs.forEach(doc=>{
                doc.players_id.forEach((pid,ind)=>{
                    User.findOne({_id:pid})
                    .then(u=>{
                        if (user.id == u.id){
                            doc.players_id[ind] = "You";
                        }else{
                            doc.players_id[ind] = u.username;
                        }
                        done++
                        if (done == donef){
                            res.send(docs);
                        }
                    })
                    .catch(err=>console.log(err))
                })
            })
        })
        .catch(err=>console.log(err))
    }else{
        Result.find({quiz_id:quizID})
        .then(docs=>{
            const results = [];
            var done = 0;
            var donef = 0;
            docs.forEach(doc=>{
                donef += doc.players_id.length;
            })
            docs.forEach(doc=>{
                doc.players_id.forEach((pid,ind)=>{
                    User.findOne({_id:pid})
                    .then(u=>{
                        if (user.id == u.id){
                            doc.players_id[ind] = "You";
                        }else{
                            doc.players_id[ind] = u.username;
                        }
                        done++
                        if (done == donef){
                            res.send(docs);
                        }
                    })
                    .catch(err=>console.log(err))
                })
            })
        })
        .catch(err=>console.log(err))
    }
})

// Dashboard Quiz Play - Results
router.post('/quiz/results', ensureAuthenticated, (req,res) => {
    const {totalPoints, quizID,numberOfQuestions} = req.body;
    const user = req.user;
    Quiz.findOne({_id:quizID})
    .then(quiz=>{
        if (quiz.registered_users.indexOf(user.id) != -1){
            // Save Results
            quiz.results.push([user.id,totalPoints]);
            // Remove Player from Registered Players
            quiz.registered_users.splice(quiz.registered_users.indexOf(user.id),1)
            // Add Player to Played Users
            quiz.played_users.push(user.id)
            // Current Partipants
            quiz.current_participants = quiz.played_users.length;
            // If Session over or not
            if(quiz.played_users.length==quiz.maximum_participants){
                var pos = [];
                quiz.results.forEach((r,i)=>{
                    if (i==0){
                        pos.push(r);
                    }else{
                        for(var j = 0;j < pos.length;j++){
                            if (parseInt(r[1])>parseInt(pos[j][1])){
                                pos.splice(j,0,r);
                                break;
                            }else if(j==pos.length-1){
                                pos.push(r);
                                break;
                            }
                        }
                    }
                })
                const players_id = [];
                const players_points = [];
                if(quiz.maximum_participants <= 20){
                    pos.forEach(p=>{
                        players_id.push(p[0])
                        players_points.push(p[1])
                    })

                    const newResult = new Result({
                        quiz_id: quiz.id,
                        round: quiz.round,
                        total_points: numberOfQuestions,
                        players_id,
                        players_points
                    });
                    newResult.save()
                    .then(result => {
                        quiz.played_users = [];
                        quiz.current_participants =0;
                        quiz.round += 1;
                        quiz.results = [];
                        quiz.save()
                        .then(q=>{
                            // Pay Winner
                            const trans = [];
                            // 1st Position
                            User.findOne({_id:pos[0][0]})
                            .then(u=>{
                                User.updateOne({_id:u.id},{$set:{
                                    revenue: u.revenue+0.8*quiz.maximum_participants*quiz.registration_fee
                                }})
                                .then(user=>{
                                    trans.push(new Transaction({
                                        type: "Congrats!! 1st Position Quiz Winner",
                                        amount: 0.8*quiz.maximum_participants*quiz.registration_fee,
                                        fee: 0,
                                        currency: "XAF",
                                        provider: "CE-Acad",
                                        old_revenue: u.revenue,
                                        new_revenue: u.revenue + 0.8*quiz.maximum_participants*quiz.registration_fee,
                                        id_user: u.id,
                                        from_to: process.env.ADMIN_ID,
                                        status: "COMPLETED"
                                    }))
                                    if (trans.length == 2){
                                        Transaction.insertMany(trans)
                                        .then(docs=>{
                                            res.send([{status:"200"}])
                                        })
                                        .catch(err=>console.log(err))
                                    }
                                })
                                .catch(err=>console.log(err))
                            })
                            .catch(err=>console.log(err))
                            
                            // Pay Winner from CE-Acad
                            User.findOne({email:"admin@ce-acad.com"})
                            .then(u=>{
                                User.updateOne({_id:u.id},{$set:{
                                    revenue_to_redistribute: u.revenue_to_redistribute-0.8*quiz.maximum_participants*quiz.registration_fee
                                }})
                                .then(user=>{
                                    trans.push(new Transaction({
                                        type: "Payed Winner",
                                        amount: -0.8*quiz.maximum_participants*quiz.registration_fee,
                                        fee: 0,
                                        currency: "XAF",
                                        provider: "CE-Acad",
                                        old_revenue: u.revenue_to_redistribute,
                                        new_revenue: u.revenue_to_redistribute - 0.8*quiz.maximum_participants*quiz.registration_fee,
                                        id_user: u.id,
                                        from_to: pos[0][0],
                                        status: "COMPLETED"
                                    }))
                                    if (trans.length == 2){
                                        Transaction.insertMany(trans)
                                        .then(docs=>{
                                            res.send([{status:"200"}])
                                        })
                                        .catch(err=>console.log(err))
                                    }
                                })
                                .catch(err=>console.log(err))
                            })
                            .catch(err=>console.log(err))
                        })
                        .catch(err=>console.log(err))
                    })
                    .catch(err=>console.log(err))
                }else{
                    var winners_id = [pos[0][0]];
                    pos.forEach((p,ind)=>{
                        players_id.push(p[0])
                        if (ind==0){
                            players_points.push(p[1]+ " - 1st Winner")
                        }
                        else if (winners_id.length == 3 || winners_id.includes(p[0])){
                            players_points.push(p[1])
                        }else{
                            winners_id.push(p[0])
                            if(winners_id.length == 2){
                                players_points.push(p[1]+ " - 2nd Winner")
                            }else{
                                players_points.push(p[1]+ " - 3rd Winner")
                            }
                        }
                    })

                    const newResult = new Result({
                        quiz_id: quiz.id,
                        round: quiz.round,
                        total_points: numberOfQuestions,
                        players_id,
                        players_points
                    });
                    newResult.save()
                    .then(result => {
                        quiz.played_users = [];
                        quiz.current_participants =0;
                        quiz.round += 1;
                        quiz.results = [];
                        quiz.save()
                        .then(q=>{
                            // Pay Winner
                            const trans = [];
                            // 1st Position
                            User.findOne({_id:winners_id[0]})
                            .then(u=>{
                                User.updateOne({_id:u.id},{$set:{
                                    revenue: u.revenue+0.8*0.5*quiz.maximum_participants*quiz.registration_fee
                                }})
                                .then(user=>{
                                    trans.push(new Transaction({
                                        type: "Congrats!! 1st Position Quiz Winner",
                                        amount: 0.8*0.5*quiz.maximum_participants*quiz.registration_fee,
                                        fee: 0,
                                        currency: "XAF",
                                        provider: "CE-Acad",
                                        old_revenue: u.revenue,
                                        new_revenue: u.revenue + 0.8*0.5*quiz.maximum_participants*quiz.registration_fee,
                                        id_user: u.id,
                                        from_to: process.env.ADMIN_ID,
                                        status: "COMPLETED"
                                    }))
                                    if (trans.length == 6){
                                        Transaction.insertMany(trans)
                                        .then(docs=>{
                                            res.send([{status:"200"}])
                                        })
                                        .catch(err=>console.log(err))
                                    }
                                })
                                .catch(err=>console.log(err))
                            })
                            .catch(err=>console.log(err))
                            // 2nd Position
                            User.findOne({_id:winners_id[1]})
                            .then(u=>{
                                User.updateOne({_id:u.id},{$set:{
                                    revenue: u.revenue+0.8*0.3*quiz.maximum_participants*quiz.registration_fee
                                }})
                                .then(user=>{
                                    trans.push(new Transaction({
                                        type: "Congrats!! 2nd Position Quiz Winner",
                                        amount: 0.8*0.3*quiz.maximum_participants*quiz.registration_fee,
                                        fee: 0,
                                        currency: "XAF",
                                        provider: "CE-Acad",
                                        old_revenue: u.revenue,
                                        new_revenue: u.revenue + 0.8*0.3*quiz.maximum_participants*quiz.registration_fee,
                                        id_user: u.id,
                                        from_to: process.env.ADMIN_ID,
                                        status: "COMPLETED"
                                    }))
                                    if (trans.length == 6){
                                        Transaction.insertMany(trans)
                                        .then(docs=>{
                                            res.send([{status:"200"}])
                                        })
                                        .catch(err=>console.log(err))
                                    }
                                })
                                .catch(err=>console.log(err))
                            })
                            .catch(err=>console.log(err))
                            // 3rd Position
                            User.findOne({_id:winners_id[2]})
                            .then(u=>{
                                User.updateOne({_id:u.id},{$set:{
                                    revenue: u.revenue+0.8*0.2*quiz.maximum_participants*quiz.registration_fee
                                }})
                                .then(user=>{
                                    trans.push(new Transaction({
                                        type: "Congrats!! 3rd Position Quiz Winner",
                                        amount: 0.8*0.2*quiz.maximum_participants*quiz.registration_fee,
                                        fee: 0,
                                        currency: "XAF",
                                        provider: "CE-Acad",
                                        old_revenue: u.revenue,
                                        new_revenue: u.revenue + 0.8*0.2*quiz.maximum_participants*quiz.registration_fee,
                                        id_user: u.id,
                                        from_to: process.env.ADMIN_ID,
                                        status: "COMPLETED"
                                    }))
                                    if (trans.length == 6){
                                        Transaction.insertMany(trans)
                                        .then(docs=>{
                                            res.send([{status:"200"}])
                                        })
                                        .catch(err=>console.log(err))
                                    }
                                })
                                .catch(err=>console.log(err))
                            })
                            .catch(err=>console.log(err))
                            // Pay Winner from CE-Acad
                            User.findOne({email:"admin@ce-acad.com"})
                            .then(u=>{
                                User.updateOne({_id:u.id},{$set:{
                                    revenue_to_redistribute: u.revenue_to_redistribute-0.8*quiz.maximum_participants*quiz.registration_fee
                                }})
                                .then(user=>{
                                    trans.push(new Transaction({
                                        type: "Payed Winner",
                                        amount: -0.8*0.5*quiz.maximum_participants*quiz.registration_fee,
                                        fee: 0,
                                        currency: "XAF",
                                        provider: "CE-Acad",
                                        old_revenue: u.revenue_to_redistribute,
                                        new_revenue: u.revenue_to_redistribute - 0.8*0.5*quiz.maximum_participants*quiz.registration_fee,
                                        id_user: u.id,
                                        from_to: winners_id[0],
                                        status: "COMPLETED"
                                    }))
                                    var oR = u.revenue_to_redistribute - 0.8*0.5*quiz.maximum_participants*quiz.registration_fee;
                                    trans.push(new Transaction({
                                        type: "Payed Winner",
                                        amount: -0.8*0.3*quiz.maximum_participants*quiz.registration_fee,
                                        fee: 0,
                                        currency: "XAF",
                                        provider: "CE-Acad",
                                        old_revenue: oR,
                                        new_revenue: oR - 0.8*0.3*quiz.maximum_participants*quiz.registration_fee,
                                        id_user: u.id,
                                        from_to: winners_id[1],
                                        status: "COMPLETED"
                                    }))
                                    oR = oR - 0.8*0.3*quiz.maximum_participants*quiz.registration_fee;
                                    trans.push(new Transaction({
                                        type: "Payed Winner",
                                        amount: -0.8*0.2*quiz.maximum_participants*quiz.registration_fee,
                                        fee: 0,
                                        currency: "XAF",
                                        provider: "CE-Acad",
                                        old_revenue: oR,
                                        new_revenue: oR - 0.8*0.2*quiz.maximum_participants*quiz.registration_fee,
                                        id_user: u.id,
                                        from_to: winners_id[2],
                                        status: "COMPLETED"
                                    }))
                                    if (trans.length == 6){
                                        Transaction.insertMany(trans)
                                        .then(docs=>{
                                            res.send([{status:"200"}])
                                        })
                                        .catch(err=>console.log(err))
                                    }
                                })
                                .catch(err=>console.log(err))
                            })
                            .catch(err=>console.log(err))
                        })
                        .catch(err=>console.log(err))
                    })
                    .catch(err=>console.log(err))
                }
            }else{
                quiz.save()
                .then(q=>{
                    res.send([{status:"200"}])
                })
                .catch(err=>console.log(err))
            }
        }else{
            res.send([{status:"200"}])
        }
    })
    .catch(err=>console.log(err))
})

// Dashboard Quiz Play - Session Expired Results
router.post('/quiz/session-expired-results', (req,res) => {
    if (typeof req.body.role !== "undefined"){
        const {totalPoints, quizID,numberOfQuestions} = req.body;
        Quiz.findOne({_id:quizID})
        .then(quiz=>{
            if (quiz.current_participants>1){
                const refParticipants = 25;
                const cP = quiz.current_participants;
                const num_winners = Math.ceil(cP/refParticipants);
                const winners_awards = [];
                // Amount Per Winner
                var totalAward = 0.8*cP*quiz.registration_fee;
                const tot = totalAward;
                for(var i = 0; i<num_winners;i++){
                    winners_awards.push(totalAward<0.8*refParticipants*500?totalAward:0.8*refParticipants*500)
                    totalAward -= 0.8*refParticipants*500;
                }
                // Positions
                var pos = [];
                quiz.results.forEach((r,i)=>{
                    if (i==0){
                        pos.push(r);
                    }else{
                        for(var j = 0;j < pos.length;j++){
                            if (parseInt(r[1])>parseInt(pos[j][1])){
                                pos.splice(j,0,r);
                                break;
                            }else if(j==pos.length-1){
                                pos.push(r);
                                break;
                            }
                        }
                    }
                })
                const players_id = [];
                const players_points = [];
                const winners_id = [];
                pos.forEach((p,ind)=>{
                    players_id.push(p[0])
                    if (ind===0){
                        winners_id.push(p[0])
                        players_points.push(p[1] + ` - Winner ${winners_id.length} - ${winners_awards[winners_id.length-1]} FCFA`)
                    } else if(winners_id.length == num_winners || winners_id.includes(p[0])){
                        players_points.push(p[1])
                    } else{
                        winners_id.push(p[0])
                        players_points.push(p[1] + ` - Winner ${winners_id.length} - ${winners_awards[winners_id.length-1]} FCFA`)
                    }
                })
                // Save Results
                const newResult = new Result({
                    quiz_id: quiz.id,
                    round: quiz.round,
                    total_points: numberOfQuestions,
                    players_id,
                    players_points
                });
                newResult.save()
                .then(result => {
                    const cP = quiz.current_participants;
                    quiz.played_users = [];
                    quiz.current_participants =0;
                    quiz.round += 1;
                    quiz.results = [];
                    quiz.save()
                    .then(q=>{
                        // Pay Winners
                        const trans = [];
                        winners_awards.forEach((award,i)=>{
                            User.findOne({_id:winners_id[i]})
                            .then(u=>{
                                User.updateOne({_id:u.id},{$set:{revenue: u.revenue + award}})
                                .then(user=>{
                                    trans.push(new Transaction({
                                        type: `Congrats!! Position ${i+1} Quiz Winner`,
                                        amount: award,
                                        fee: 0,
                                        currency: "XAF",
                                        provider: "CE-Acad",
                                        old_revenue: u.revenue,
                                        new_revenue: u.revenue + award,
                                        id_user: u.id,
                                        from_to: process.env.ADMIN_ID,
                                        status: "COMPLETED"
                                    }))
                                    if (trans.length == 2*num_winners){
                                        Transaction.insertMany(trans)
                                        .then(docs=>{
                                            res.send([{status:"200"}])
                                        })
                                        .catch(err=>console.log(err))
                                    }
                                })
                                .catch(err=>console.log(err))
                            })
                            .catch(err=>console.log(err))
                        })

                        // Pay Winner from CE-Acad
                        User.findOne({email:"admin@ce-acad.com"})
                        .then(u=>{
                            User.updateOne({_id:u.id},{$set:{
                                revenue_to_redistribute: u.revenue_to_redistribute-tot
                            }})
                            .then(user=>{
                                var r2r = u.revenue_to_redistribute;
                                for(var i = 0; i<num_winners;i++){
                                    trans.push(new Transaction({
                                        type: "Payed Winner",
                                        amount: -winners_awards[i],
                                        fee: 0,
                                        currency: "XAF",
                                        provider: "CE-Acad",
                                        old_revenue: r2r,
                                        new_revenue: r2r - winners_awards[i],
                                        id_user: u.id,
                                        from_to: winners_id[i],
                                        status: "COMPLETED"
                                    }))
                                    r2r = r2r - winners_awards[i];
                                }
                                if (trans.length == 2*num_winners){
                                    Transaction.insertMany(trans)
                                    .then(docs=>{
                                        res.send([{status:"200"}])
                                    })
                                    .catch(err=>console.log(err))
                                }
                            })
                            .catch(err=>console.log(err))
                        })
                        .catch(err=>console.log(err))
                    })
                    .catch(err=>console.log(err))
                })
                .catch(err=>console.log(err))
            }else{
                res.send("Not Enough Participants for results")
            }
        })
        .catch(err=>console.log(err))
    }else{
        res.send("Unauthorized Access")
    }
})

//Dashboard Quiz Register
router.post('/quiz/register', ensureAuthenticated, (req,res) => {
    const edit = req.body.id;
    const trans = [];
    req.body.registration_fee = parseInt(req.body.registration_fee);
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
                        {_id : req.user.id},
                        {$set: {revenue: req.user.revenue - req.body.registration_fee}},{ upsert: true })
                        .then(user=>{
                            trans.push(new Transaction({
                                type: "Quiz Registration",
                                amount: -req.body.registration_fee,
                                fee: 0,
                                currency: "XAF",
                                provider: "CE-Acad",
                                old_revenue: req.user.revenue,
                                new_revenue: req.user.revenue - req.body.registration_fee,
                                id_user: req.user.id,
                                from_to: process.env.ADMIN_ID,
                                status: "COMPLETED"
                            }))
                            Quiz.findOne({_id:req.body.id})
                            .then(quiz=>{
                                quiz.registered_users.push(req.user.id)
                                Quiz.updateOne({_id:req.body.id},{$set:{registered_users:quiz.registered_users}},{ upsert: true })
                                .then(q=> {
                                    if (trans.length == 5){
                                        Transaction.insertMany(trans)
                                        .then(docs=>{
                                            req.flash(
                                                'success_msg',
                                                'Registration Successful'
                                            );
                                            res.redirect('/dashboard/quiz/?edit=' + edit)
                                        })
                                        .catch(err=>console.log(err))
                                    }
                                })
                                .catch(err=>console.log(err))
                            })
                            .catch(err=>console.log(err))
                        })
                        .catch(err=>console.log(err))

                    // Pay Affiliates
                    User.findOne({_id:req.user.affiliate})
                    .then(u=>{
                        User.updateOne({_id:req.user.affiliate},{$set:{revenue:u.revenue+0.05*req.body.registration_fee}})
                        .then(v=>{
                            trans.push(new Transaction({
                                type: "Affiliate Due",
                                amount: 0.05*req.body.registration_fee,
                                fee: 0,
                                currency: "XAF",
                                provider: "CE-Acad",
                                old_revenue: u.revenue,
                                new_revenue: u.revenue + 0.05*req.body.registration_fee,
                                id_user: u.id,
                                from_to: req.user.id,
                                status: "COMPLETED"
                            }))
                            User.findOne({_id:u.affiliate})
                            .then(u2=>{
                                User.updateOne({_id:u2.id},{$set:{revenue:u2.revenue+0.05*req.body.registration_fee}})
                                .then(v=>{
                                    trans.push(new Transaction({
                                        type: "Second Order Affiliate Due",
                                        amount: 0.05*req.body.registration_fee,
                                        fee: 0,
                                        currency: "XAF",
                                        provider: "CE-Acad",
                                        old_revenue: u2.revenue,
                                        new_revenue: u2.revenue + 0.05*req.body.registration_fee,
                                        id_user: u2.id,
                                        from_to: req.user.id,
                                        status: "COMPLETED"
                                    }))
                                    // Pay CE-Acad (Percentage due and redistribute)
                                    User.findOne({email:"admin@ce-acad.com"})
                                    .then(u=>{
                                        User.updateOne({email:"admin@ce-acad.com"},{$set:{
                                            revenue: u.revenue+0.04*req.body.registration_fee,
                                            revenue_to_redistribute: u.revenue_to_redistribute+0.8*req.body.registration_fee
                                        }})
                                        .then(user=>{
                                            trans.push(new Transaction({
                                                type: "Player Registered Gain",
                                                amount: 0.04*req.body.registration_fee,
                                                fee: 0,
                                                currency: "XAF",
                                                provider: "CE-Acad",
                                                old_revenue: u.revenue,
                                                new_revenue: u.revenue + 0.04*req.body.registration_fee,
                                                id_user: u.id,
                                                from_to: req.user.id,
                                                status: "COMPLETED"
                                            }))
                                            trans.push(new Transaction({
                                                type: "Player Registered",
                                                amount: 0.8*req.body.registration_fee,
                                                fee: 0,
                                                currency: "XAF",
                                                provider: "CE-Acad",
                                                old_revenue: u.revenue_to_redistribute,
                                                new_revenue: u.revenue_to_redistribute + 0.8*req.body.registration_fee,
                                                id_user: u.id,
                                                from_to: req.user.id,
                                                status: "COMPLETED"
                                            }))
                                            // Pay God and Ambassadors
                                            //KellyM
                                            User.findOne({_id:"5e01f4ae3cfe8c110cfb6d19"})
                                            .then(u2=>{
                                                User.updateOne({_id:u2.id},{$set:{revenue:u2.revenue+0.01*req.body.registration_fee}})
                                                .then(v=>{
                                                    trans.push(new Transaction({
                                                        type: "Ambassador",
                                                        amount: 0.01*req.body.registration_fee,
                                                        fee: 0,
                                                        currency: "XAF",
                                                        provider: "CE-Acad",
                                                        old_revenue: u2.revenue,
                                                        new_revenue: u2.revenue + 0.01*req.body.registration_fee,
                                                        id_user: u2.id,
                                                        from_to: req.user.id,
                                                        status: "COMPLETED"
                                                    }))
                                                    if (trans.length == 10){
                                                        Transaction.insertMany(trans)
                                                        .then(docs=>{
                                                            req.flash(
                                                                'success_msg',
                                                                'Registration Successful'
                                                            );
                                                            res.redirect('/dashboard/quiz/?edit=' + edit)
                                                        })
                                                        .catch(err=>console.log(err))
                                                    }
                                                })
                                                .catch(err=>console.log(err))
                                            })
                                            .catch(err=>console.log(err))
                                            // Roche97
                                            User.findOne({_id:"5e01f36b3cfe8c110cfb6d18"})
                                            .then(u2=>{
                                                User.updateOne({_id:u2.id},{$set:{revenue:u2.revenue+0.01*req.body.registration_fee}})
                                                .then(v=>{
                                                    trans.push(new Transaction({
                                                        type: "Ambassador",
                                                        amount: 0.01*req.body.registration_fee,
                                                        fee: 0,
                                                        currency: "XAF",
                                                        provider: "CE-Acad",
                                                        old_revenue: u2.revenue,
                                                        new_revenue: u2.revenue + 0.01*req.body.registration_fee,
                                                        id_user: u2.id,
                                                        from_to: req.user.id,
                                                        status: "COMPLETED"
                                                    }))
                                                    if (trans.length == 10){
                                                        Transaction.insertMany(trans)
                                                        .then(docs=>{
                                                            req.flash(
                                                                'success_msg',
                                                                'Registration Successful'
                                                            );
                                                            res.redirect('/dashboard/quiz/?edit=' + edit)
                                                        })
                                                        .catch(err=>console.log(err))
                                                    }
                                                })
                                                .catch(err=>console.log(err))
                                            })
                                            .catch(err=>console.log(err))
                                            //Berto
                                            User.findOne({_id:"5e1449eea5a2643ab09cb3ce"})
                                            .then(u2=>{
                                                User.updateOne({_id:u2.id},{$set:{revenue:u2.revenue+0.01*req.body.registration_fee}})
                                                .then(v=>{
                                                    trans.push(new Transaction({
                                                        type: "Ambassador",
                                                        amount: 0.01*req.body.registration_fee,
                                                        fee: 0,
                                                        currency: "XAF",
                                                        provider: "CE-Acad",
                                                        old_revenue: u2.revenue,
                                                        new_revenue: u2.revenue + 0.01*req.body.registration_fee,
                                                        id_user: u2.id,
                                                        from_to: req.user.id,
                                                        status: "COMPLETED"
                                                    }))
                                                    if (trans.length == 10){
                                                        Transaction.insertMany(trans)
                                                        .then(docs=>{
                                                            req.flash(
                                                                'success_msg',
                                                                'Registration Successful'
                                                            );
                                                            res.redirect('/dashboard/quiz/?edit=' + edit)
                                                        })
                                                        .catch(err=>console.log(err))
                                                    }
                                                })
                                                .catch(err=>console.log(err))
                                            })
                                            .catch(err=>console.log(err))
                                            //GCM
                                            User.findOne({_id:"5e23f17303af306e4f6a160d"})
                                            .then(u2=>{
                                                User.updateOne({_id:u2.id},{$set:{revenue:u2.revenue+0.02*req.body.registration_fee}})
                                                .then(v=>{
                                                    trans.push(new Transaction({
                                                        type: "Gospel",
                                                        amount: 0.02*req.body.registration_fee,
                                                        fee: 0,
                                                        currency: "XAF",
                                                        provider: "CE-Acad",
                                                        old_revenue: u2.revenue,
                                                        new_revenue: u2.revenue + 0.02*req.body.registration_fee,
                                                        id_user: u2.id,
                                                        from_to: req.user.id,
                                                        status: "COMPLETED"
                                                    }))
                                                    if (trans.length == 10){
                                                        Transaction.insertMany(trans)
                                                        .then(docs=>{
                                                            req.flash(
                                                                'success_msg',
                                                                'Registration Successful'
                                                            );
                                                            res.redirect('/dashboard/quiz/?edit=' + edit)
                                                        })
                                                        .catch(err=>console.log(err))
                                                    }
                                                })
                                                .catch(err=>console.log(err))
                                            })
                                            .catch(err=>console.log(err))
                                            // reinvest
                                            User.findOne({_id:"5e23f2c803af306e4f6a160f"})
                                            .then(u2=>{
                                                User.updateOne({_id:u2.id},{$set:{revenue:u2.revenue+0.01*req.body.registration_fee}})
                                                .then(v=>{
                                                    trans.push(new Transaction({
                                                        type: "Reinvest for Site Maintainance",
                                                        amount: 0.01*req.body.registration_fee,
                                                        fee: 0,
                                                        currency: "XAF",
                                                        provider: "CE-Acad",
                                                        old_revenue: u2.revenue,
                                                        new_revenue: u2.revenue + 0.01*req.body.registration_fee,
                                                        id_user: u2.id,
                                                        from_to: req.user.id,
                                                        status: "COMPLETED"
                                                    }))
                                                    if (trans.length == 10){
                                                        Transaction.insertMany(trans)
                                                        .then(docs=>{
                                                            req.flash(
                                                                'success_msg',
                                                                'Registration Successful'
                                                            );
                                                            res.redirect('/dashboard/quiz/?edit=' + edit)
                                                        })
                                                        .catch(err=>console.log(err))
                                                    }
                                                })
                                                .catch(err=>console.log(err))
                                            })
                                            .catch(err=>console.log(err))

                                            if (trans.length == 10){
                                                Transaction.insertMany(trans)
                                                .then(docs=>{
                                                    req.flash(
                                                        'success_msg',
                                                        'Registration Successful'
                                                    );
                                                    res.redirect('/dashboard/quiz/?edit=' + edit)
                                                })
                                                .catch(err=>console.log(err))
                                            }
                                        })
                                        .catch(err=>console.log(err))
                                    })
                                    .catch(err=>console.log(err))
                                    // if (trans.length == 5){
                                    //     Transaction.insertMany(trans)
                                    //     .then(docs=>{
                                    //         req.flash(
                                    //             'success_msg',
                                    //             'Registration Successful'
                                    //         );
                                    //         res.redirect('/dashboard/quiz/?edit=' + edit)
                                    //     })
                                    //     .catch(err=>console.log(err))
                                    // }
                                })
                                .catch(err=>console.log(err))
                            })
                            .catch(err=>console.log(err))
                        })
                        .catch(err=>console.log(err))
                    })
                    .catch(err=>console.log(err))

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
        .catch(err=>console.log(err))
    }
    
})

router.get('/profile/get-referree', ensureAuthenticated, (req,res) => {
    User.find({affiliate:req.user.id})
    .then(docs=>{
        res.send(docs)
    })
    .catch(err=>console.log(err))
})

router.get('/profile/get-all-emails', ensureAuthenticated, (req,res) => {
    if(req.user.email == "admin@ce-acad.com"){
        const em = [];
        User.find()
        .then(docs=>{
            docs.forEach(d=>{
                em.push(d.email)
                if(em.length==docs.length){
                    res.send(em)
                }
            })
        })
        .catch(err=>console.log(err))
    }else{
        res.send("Unauthorized Access")
    }
})

// Correction of Results
// router.get('/quiz/coreectRes', (req,res) => {
//     var quiz;
//     Quiz.findOne({_id:"5e18e7621c9d440000fedbe1"})
//     .then(q=>{
//         quiz = q;
//         Result.findOne({_id:"5e191000350e21377c628c26"})
//         .then(r=>{
//             console.log(r)
//             const point = r.players_points.reverse();
//             r.players_id.reverse().forEach((pid,ind)=>{
//                 quiz.played_users.unshift(pid)
//                 quiz.results.unshift([pid,point[ind]])
//                 quiz.current_participants++
//             })
//             quiz.save()
//             .then(q=>{
//                 res.send("Done")
//             })
//         })
//     })
// })

module.exports = router;