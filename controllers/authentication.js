const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var randomString = require('randomstring');
var async = require('async');
const ModelUser = require('../models/usersData.model');
const config = require('../config/config');
const nodeMailer = require('nodemailer');
const request = require('request');
var ejs = require("ejs");
// Generate JWT
function generateToken(user,newRandomSecret) {

    var toGenererateToken = {
      _id: user._id,
      secretString : newRandomSecret
    }
    return jwt.sign(toGenererateToken, config.jwt.secret);
}

//= =======================================
// Registration Route
//= =======================================

exports.registration = async function (req, res, next) {

  // console.log(req);
  let email = (req.body.email).toLowerCase();
  let name = req.body.name;
  let existingUser;

  ModelUser.findOne({email:email}, {email:1},function(err,user){
    if(user){
      return res.status(200).json({
        status: 'FAIL' ,
        toast:'Email already exists. Please register using another mail-id.'
      });
    }else{
      let password = req.body.password;
      bcrypt.genSalt(10, function(err,salt) {
        bcrypt.hash(password, salt, function(err, hash){
          if(!err) {

            let token;
            let randomSecret = [];
            randomSecret.push(randomString.generate(5));

            crypto.randomBytes(20, function(err, buffer) {
              token = buffer.toString('hex');

              const user = new ModelUser({
                _id: new  mongoose.Types.ObjectId(),
                email: email,
                password: hash,
                name: name,
                secret : randomSecret[0],
                confirmToken : token
              });

              user.save((err, user) => {
                if (err) { return next(err); }
              })

              var data = {
                email: email,
                name: name,
                link: "http://3.110.94.182:3002/mobileapp/auth/confirm_registration/"+token
              }

              ejs.renderFile("./views/sign-up.ejs", {data:data}, function (err, data) {
                if(err){
                  console.log(err);
                }else{
                  var smtpTransport = nodeMailer.createTransport({

                      service:'gmail',
                      auth: {
                        user: config.passwordCredentials.user,
                        pass: config.passwordCredentials.pass
                      }
                  })

                  var mailOptions = {
                    from: config.passwordCredentials.user,
                    to: email,
                    subject: 'Mail confirmation',
                    html: data
                  };

                  smtpTransport.sendMail(mailOptions, function (err, info) {
                    if(err){
                      console.log(err);
                    }else{
                      console.log("Registration Mail sent");
                    }
                  });
                  return res.status(200).json({
                    status: 'SUCCESS' ,
                    toast:'Registration mail sent'
                  });
                }
              });
            })
          }else{
            return res.status(422).json({ error: 'Failed' });
          }
        });
      })
    }
  })
};

exports.render_confirmRegistration = function (req, res, next) {

  ModelUser.findOne({ confirmToken: req.params.token },{confirmToken:1},function(err, user) {
    if (user) {
      res.render('confirm', {token: req.params.token});
    }else{
      res.render('tokenExpired');
    }
  });
}

exports.confirmRegistration = async function (req, res, next) {

  ModelUser.findOneAndUpdate({confirmToken: req.params.token},{$set:{DummyAccount:"N"}},function(err, result){
    if(err || !result){
      res.render('tokenExpired');
    }else{
      res.render('finalConfirm');
    }
  });
}

//= =======================================
// Login Route
//= =======================================

exports.newLogin = async function (req, res, next) {

  // let myObjectId = mongoose.Types.ObjectId(req.user._id);
  let email = (req.body.email).toLowerCase();
  // console.log("new login called");
  ModelUser.findOne({email:email} , function(err,existingUserFromDb){
    if(existingUserFromDb){
      if(existingUserFromDb.DummyAccount === "N"){
        res.status(200).json({
          token: generateToken(existingUserFromDb,existingUserFromDb.secret[0]),
          status: 'SUCCESS',
          user : req.user,
          toast:'Login successful.'
        });
      }else{
        res.status(200).json({
          status: 'AUTH_FAIL',
          toast:'Verify your account from mailbox'
        });
      }
    }else{
      res.status(200).json({
        status: 'FAIL',
        toast:'Email not found.'
      });
    }
  })
};

//= =======================================
// changePassword Route
//= =======================================

exports.changepassword = (req,res,next) => {

  var myObjectId = mongoose.Types.ObjectId(req.user._id);
  var oldPasswordFromReq = req.body.oldPassword;
  var newPasswordFromReq = req.body.newPassword;
  var newRandomSecert = [];
  newRandomSecert.push(randomString.generate(5));

  ModelUser.findById(myObjectId,function(err,userFromDB){
    // config.logs.db("Change password DB->User userId",process.memoryUsage())
    if(err) {console.log(err);}

    bcrypt.compare(oldPasswordFromReq,userFromDB.password, (err,result)=> {
      if(err || !result) {
        //console.log("falseeee");
        res.status(200).json({
          status : 'FAIL',
          toast : 'Please enter correct existing password'
        });
      }else{
        bcrypt.genSalt(10, function(err,salt) {
          bcrypt.hash(newPasswordFromReq, salt, function(err, hash){
            if(err) {console.log(err);
            }else{
              ModelUser.findByIdAndUpdate(myObjectId, {$set: {password: hash, secret:newRandomSecert[0] }},function(err,callback)
              {
                // config.logs.db("Change Password DB->User to update pass(authentication)",process.memoryUsage())
                if(err){console.log(err);}
              })
            }
          });
        });
        res.status(200).json({
          token:generateToken(userFromDB,newRandomSecert[0]),
          status : 'SUCCESS',
          toast : 'Password changed successfully'
        });
      }
    });
  })
};

//= =======================================
// wrong Password
//= =======================================

exports.wrongpassword = function(req,res,next) {
  res.status(200).json({ status: 'FAIL',toast: 'Invalid Username or Password ' });
}

//= =======================================
// resetNew Password
//= =======================================

exports.forgot_password = function(req, res, next) {

  var emailFromReq = req.body.email;

    async.waterfall([
      function(done) {
        ModelUser.findOne({email: req.body.email}).exec(function(err, user) {
          if (!user) {
            res.status(200).json({
              status:'FAIL',
              toast:'Email is not registered'
            })
          } else {
            done(err, user);
          }
        });
      },
      function(user, done) {
        crypto.randomBytes(20, function(err, buffer) {
          var token = buffer.toString('hex');
          done(err, user, token);
        });
      },
      function(user, token, done) {

        ModelUser.findByIdAndUpdate({ _id: user._id }, { resetPasswordToken: token }, { upsert: true, new: true }).exec(function(err, new_user) {
          done(err, token, new_user);
        });
      },
      function(token, user, done) {

        var data = {
          email: emailFromReq,
          name: user.name,
          link: "http://3.110.94.182:3002/mobileapp/auth/reset_password/"+token
        }

        ejs.renderFile("./views/reset.ejs", {data:data}, function (err, data) {
          if(err){
            console.log(err);
          }else{
            var smtpTransport = nodeMailer.createTransport({

                service:'gmail',
                auth: {
                  user: config.passwordCredentials.user,
                  pass: config.passwordCredentials.pass
                }
            })

            var mailOptions = {
              from: config.passwordCredentials.user,
              to: emailFromReq,
              subject: 'Reset Password',
              html: data
            };

            smtpTransport.sendMail(mailOptions, function (err, info) {
              if(err){
                console.log(err);
              }else{
                console.log("Reset Mail sent");
              }
            });
            return res.status(200).json({
              status: 'SUCCESS' ,
              toast:'Reset Mail sent'
            });
          }
        });
      }
    ], function(err) {

    });
  };

exports.render_reset_password_template =  function(req, res, next) {
  console.log("111");
  ModelUser.findOne({ resetPasswordToken: req.params.token }, function(err, user) {
    console.log("2222");
    if (!user) {
      res.render('tokenExpired');
    }else{
      res.render('resetPassword', {token: req.params.token});
    }
  });
};

exports.reset_password = function(req, res, next) {
  var newRandomSecert = [];
  newRandomSecert.push(randomString.generate(5));

  async.waterfall([
    function(done) {

      ModelUser.findOne({ resetPasswordToken: req.params.token }, function(err, user) {

        if (!user) {
          res.render('tokenExpired')
        }
        if(req.body.password === req.body.confirm) {
          var newPassword = req.body.password;
          bcrypt.genSalt(10, function(err,salt) {
            bcrypt.hash(newPassword, salt, function(err, hash){

              ModelUser.findOneAndUpdate({resetPasswordToken: req.params.token},{$set: {resetPasswordToken: " ", password:hash, secert:newRandomSecert}},function(err, result){
                done(err, user);
              })
            })
          })
        }else{
          return res.redirect('back');
        }
      });
    },
    function(user, done) {
      done('done');
    }
  ], function(err) {
    res.render('resetPasswordFinal');
})
};
