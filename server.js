'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }); 

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});

// create mongo-db schema and model
let shortURLSchema = new mongoose.Schema({
  original_url: {type: String, required: true},
  short_url: {type: String, required: true}
});

let ShortURL = mongoose.model('ShortURL', shortURLSchema);

// API endpoint POST /new
app.post('/api/shorturl/new', function(req, res) {
  let inputURL = undefined;
  // check format of input
  try {
    inputURL = new URL(req.body.url);  
  }
  catch(err) {
    return res.json({"error": "invalid URL"});  
  }
  
  // check valid domain
  ShortURL.findOne({original_url: inputURL.toString()}, (err, result) => {
    // handle error
    if (err) {
      console.error(err);
    }
    // handle result
    if (result) {
      return res.json({"original_url": result.original_url, "short_url": result._id});
    } else {
      ShortURL.create([{original_url: inputURL.toString()}], (err, newurl) => {
        if (err) {
          console.error(err);
        } else {
          return res.send({"original_url": newurl.original_url, "short_url": newurl._id});
        }
      })
    }
    
  });
});

app.get('/api/shorturl/:shorturl_string?', function(req, res){
  ShortURL.findById(req.params.shorturl_string, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      res.redirect(result.original_url);
    }
  });
});