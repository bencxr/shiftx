var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var routes = require('./app/routes');
var cors = require('cors');

require('./config.js');
require('./app/scripts/initialization');
require('./app/scripts/background');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shiftx'); // connect to our database

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// uncomment after placing your favicon in /public
// var favicon = require('serve-favicon');
// app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());

// get external URL root
app.enable('trust proxy'); // to maintain HTTPS protocol detection through ngrok and other proxies
app.use(function(req, res, next) {
  req.root = req.protocol + '://' + req.get('host') + '/';
  next();
});

app.use('/api', routes);
app.use(express.static(path.join(__dirname, 'public')));
app.use('*', function(req,res) {
  res.sendfile(path.join(__dirname, 'public', 'index.html'));
});

var port = process.env.PORT || 4000;        // set our port
module.exports = app.listen(port);
console.log("Listening on port 4000..");