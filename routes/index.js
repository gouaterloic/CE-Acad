const express = require('express');
const router = express.Router();
const uf = require('../usefulFunctions/usefulFunctions');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const { forwardAuthenticated } = require('../config/auth');

router.get('/', forwardAuthenticated,(req,res) => res.render('home'))

router.post('/ressetpass', function(req,res){
    // Values optained from user
    const {email} = req.body;
    const errors = [];
    // Check required fields
    if(!email){
        errors.push({msg:'Email field must be filled'});
    }
    // Check Email Validity
    else if(!uf.isEmail(email)){
        errors.push({msg:'Enter valid Email address'});
    }
    
    if(errors.length > 0){
        req.flash(
            'error_msg',
            errors[0].msg
        );
        res.redirect('/')
    } else{
       User.findOne({email:email})
       .then(user=>{
           if(user){
                // Hash Password
                const password = (new Date()).getTime().toString(36);
                bcrypt.genSalt(10,(err,salt)=>
                bcrypt.hash(password, salt, (err,hash)=>{
                    if(err) throw err;
                    user.password = hash;
                    user.save()
                    .then(u=>{
                        if (u){
                            // create reusable transporter object using the default SMTP transport
                            // let transporter = nodemailer.createTransport({
                            //     host: "ce-acad.com",
                            //     port: 465,
                            //     secure: true, // true for 465, false for other ports
                            //     auth: {
                            //     user: "admin@ce-acad.com", // generated ethereal user
                            //     pass: ".IlovemyGod2CD." // generated ethereal password
                            //     }
                            // });
                            let transporter = nodemailer.createTransport({
                                host: "ce-acad.com",
                                port: 465,
                                auth: {
                                  user: "admin@ce-acad.com",
                                  pass: ".IlovemyGod2CD."
                                }
                              });

                            // send mail with defined transport object
                            transporter.sendMail({
                                from: '"CE-ACAD" <admin@ce-acad.com>', // sender address
                                to: `${user.email}`, // list of receivers
                                subject: "New Password", // Subject line
                                html: `<p>Dear ${user.username},<br> Your new password is <strong><em>${password}</em></strong> <br>Use this password to log into your account. You can always change your password in your profile from your dashboard. <br><br> <strong>Best Regards, <br>CE-Acad</strong></p>` // html body
                            })
                            .then(info =>{
                                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                                req.flash(
                                    'success_msg',
                                    'You have been sent an email with your new password'
                                );
                                res.redirect('/')
                            })
                            .catch(err => console.log(err))
                        }
                    })
                    .catch(err=>console.log(err))
                    }))
                
           }else{
                req.flash(
                    'error_msg',
                    'Email does not exist'
                );
                res.redirect('/')
           }
       })

    }
}); 

module.exports = router;