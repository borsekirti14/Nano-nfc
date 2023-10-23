const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/config');
const expressValidator = require('express-validator');
const router = require('./router/mainRouter');
var async = require('async');
const app = express();
const session = require('express-session');
const passport = require('passport');

app.use(bodyParser.urlencoded({ limit: '50mb',extended: true }))
app.use(bodyParser.json({limit: '50mb',extended:true}))

const http = require('http');
var server = http.createServer(app);
app.set('view engine', 'ejs')
app.set('views', './views')
app.use(express.static('public'))

server.listen(config.server.port, function(){
   console.log('Server is running on Port : ',config.server.port);
});

app.use(passport.initialize())
app.use(passport.session())

app.use('/test',function(req,res){
  console.log("hellooooo");
})
router(app);
mongoose.connect(config.db.mongodb,{useNewUrlParser: true, useUnifiedTopology: true}, function(err,client) {
    if (err) {
        console.log("DB not connected");
    }else {
        console.log("DB connected");
    }
});

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
