const express = require('express');
const router = express.Router();
const Question = require('../models/Questions');
//const { forwardAuthenticated } = require('../config/auth');

// Question Manager
router.get('/question-manager',(req,res) => {
    // Search Questions
    if (typeof req.query["searchBy"] != 'undefined'){
        const searchBy = req.query["searchBy"];
        const searchTerm = req.query["searchTerm"];
        if(!searchTerm){
            let errors = [{msg:'Enter Search Term'}];
            res.render('admin-questions-management',{errors});
        }else{
            switch (searchBy){
                case 'label': 
                    Question.find({"label" : {$regex : `.*${searchTerm}.*`, '$options' : 'i'}})
                    .exec()
                    .then(doc=>{
                        res.render('admin-questions-management',{doc});
                    })
                    .catch(err=>console.log())
                    break;
                case 'subject':
                    Question.find({subject:searchTerm})
                    .exec()
                    .then(doc=>{
                        res.render('admin-questions-management',{doc});
                    })
                    .catch(err=>console.log())
                    break;
                case 'topic':
                    Question.find({topic:searchTerm})
                    .exec()
                    .then(doc=>{
                        res.render('admin-questions-management',{doc});
                    })
                    .catch(err=>console.log())
                    break;
                case 'level':
                    Question.find({level:searchTerm})
                    .exec()
                    .then(doc=>{
                        res.render('admin-questions-management',{doc});
                    })
                    .catch(err=>console.log())
                    break;
            }
        }
    }else{
        res.render('admin-questions-management')
    };
});


router.post('/question-manager',(req,res) => {
    // Collection of Data
    const subject = req.body.subject;
    const topic = req.body.topic;
    const level = req.body.level;
    const label = req.body.label;
    const answer1 = req.body.answer1;
    const answer2 = req.body.answer2;
    const answer3 = req.body.answer3;
    const answer4 = req.body.answer4;
    // Validation
    let errors = [];
    // Check required fields
    if(!label || !answer1 || !answer2 || !answer3 || !answer4){
        errors.push({msg:'All fields are required'});
    }
    else if(!req.body.correctAnswer){
        errors.push({msg:'Select the correct answer'});
    }

    if(errors.length > 0){
        res.render('admin-questions-management',{errors,label,answer1,answer2,answer3,answer4,subject,topic,level});
    } else{
       Question.findOne({label:label})
       .then(question=>{
           if(question){
            errors.push({msg:'Question Already exists'});
            res.render('admin-questions-management',{errors,label,answer1,answer2,answer3,answer4,subject,topic,level});
           }else{
            const answers = [answer1,answer2,answer3,answer4];   
            const correct = answers[Number(req.body.correctAnswer)];
            const newQuestion = new Question({label,answers,correct,subject,topic,level});
            newQuestion.save()
            .then(question => {
                let successes = [{msg:'Question Added'}]
                res.render('admin-questions-management',{successes,subject,topic,level})
            })
            .catch(err=> console.log(err));
           }
       })

    }
});

module.exports = router;