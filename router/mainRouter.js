const express = require('express');
const passport = require('passport');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const request = require('request');
const async = require('async');
const ModelUser = require('../models/usersData.model');
const DataController = require('../controllers/data');
const AuthenticationController = require('../controllers/authentication');
const passportService = require('../config/passport');

// Middleware to require login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireSNAppEmailLogin = passport.authenticate('local', { failureRedirect: 'http://13.234.134.240:5000/mobileapp/v1/auth/wrongPassword'});


module.exports = function (app) {
  // Initializing route groups
  const apiRoutes = express.Router(),
  authRoutes = express.Router(),
  dataRoutes = express.Router()
  profileDetails = express.Router()

	app.use('/', apiRoutes);

  apiRoutes.use('/mobileapp/sync', dataRoutes);
  apiRoutes.use('/mobileapp/auth', authRoutes);
  apiRoutes.use('/mobileapp/profileData',profileDetails);

//   = ========================
//   Auth Routes
//   = ========================

  authRoutes.post('/register',AuthenticationController.registration);
  authRoutes.get('/confirm_registration/:token',AuthenticationController.render_confirmRegistration);
  authRoutes.post('/confirm_registration/:token',AuthenticationController.confirmRegistration);

  authRoutes.post('/logIn', requireSNAppEmailLogin, AuthenticationController.newLogin);
  authRoutes.get('/wrongPassword',AuthenticationController.wrongpassword);

  authRoutes.post('/forgotPassword',AuthenticationController.forgot_password);
  authRoutes.get('/reset_password/:token', AuthenticationController.render_reset_password_template);
  authRoutes.post('/reset_password/:token',AuthenticationController.reset_password);

//   = ========================
//   User Routes
//   = ========================

	dataRoutes.post('/fetchData', requireAuth, DataController.fetchData);
  dataRoutes.post('/manageData', requireAuth, DataController.manageData);
  dataRoutes.post('/deleteData', requireAuth, DataController.deleteData);


  // profileDetails.post('/dropProfile',requireAuth,DataController.dropProfile);

  // mqttRoute.get('/renderDeleteProfile_template/:token', MqttController.renderDeleteProfile_template);
  // mqttRoute.post('/deleteProfile/:token',MqttController.deleteProfile);

  profileDetails.post('/changePassword', requireAuth,AuthenticationController.changepassword);
  // profileDetails.post('/newChangePassword', requireAuth,AuthenticationController.newChangePassword);



};
