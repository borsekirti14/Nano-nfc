// Importing Passport, strategies, and config
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
var crypto = require('crypto')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var randomString = require('randomstring');
const nodeMailer = require('nodemailer');
const ModelUser = require('../models/usersData.model');
const config = require('./config');
var async = require('async');
const request = require('request');

passport.serializeUser(function(user, done) {
    done(null, user.email);
})

passport.deserializeUser(function(id, done) {
  var match = false;
  var userToSend;

  ModelUser.findOne({email: id}, function (err, user) {
    if(user){
      match = true;
      userToSend = user;
      done(err,userToSend)
    }
  })
})

// Setting username field to email rather than username
const localOptions = {
    usernameField: 'email'
};

// Setting up local login strategy
const localLogin = new LocalStrategy(localOptions, (email, password,done) => {
  
  ModelUser.findOne({ email:email.toLowerCase() }, async (err, user) => {
    if(!user){
      return done(null, false,{status:'User not found'});
    }
    if(user) {
      await user.comparePassword(password, (err, isMatch) => {

        if (!isMatch) {
          return done(null, false, { status: 'PASSWORD MISMATCH' });
        }else if (isMatch) {
          return done(null, user);
        }
      });
    }
  });
});

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"),
    secretOrKey: config.jwt.secret
};

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {

    var myObjectId = mongoose.Types.ObjectId(payload._id);

    ModelUser.findById(myObjectId, (err, user) => {
      if (user && user.secret[0] == payload.secretString) {
        done(null,user);
      }else {
        done(null,false,{status:"Token error"});
      }
    });
});


passport.use(jwtLogin);
passport.use(localLogin);
