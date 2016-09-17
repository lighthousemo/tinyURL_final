const express = require("express");
const app = express();
const methodOverride = require("method-override");
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

var urlDatabase = {
  "AAAAAA": "http://www.cats.ca",
  "BBBBBB": "http://www.dogs.com"
};

// [
//   { "_id" : ObjectId("57dc88ae2981fae5f640b85f"), "shortURL" : "b2xVn2", "longURL" : "http://www.lighthouselabs.ca" }
//   { "_id" : ObjectId("57dc88ae2981fae5f640b860"), "shortURL" : "9sm5xK", "longURL" : "http://www.google.com" }
// ]

console.log(`Connecting to MongoDB running at: ${MONGODB_URI}`);

// var dbInstance;

// MongoClient.connect(MONGODB_URI, (err, db) => {
//     if (err) {
//     console.log('Could not connect! Unexpected error. Details below.');
//     throw err;
//   }
//   dbInstance = db;


//   console.log('Connected to the database!');
//   let collection = db.collection("urls");

//   console.log('Retreiving documents for the "test" collection...');
//   collection.find().toArray((err, results) => {
//     console.log('results: ', results);



//   });
// });


function findURLs(){

  connectAndThen(function(err, db){
    // use db to find urls
    db.collection("urls").find({}, function(results){
      console.log("This many results: "+results.length);
    });
  });
}



function generateRandomString() {
   var text = "";
 var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 for( var i=0; i < 6; i++ )
   text += possible.charAt(Math.floor(Math.random() * possible.length));
 return text;
}



function getLongURL(db, shortURL, cb) {
  let query = { "shortURL": shortURL };
  db.collection("urls").findOne(query, (err, result) => {
    if (err) {
      return cb(err);
    }
    return cb(null, result.longURL);
  });
}



function connectAndThen(cb){

  MongoClient.connect(MONGODB_URI, (err, db) => {
    cb(err, db);
  });
}


app.get("/urls", (req, res) => {


  connectAndThen(function(err, db){

    console.log("Connected to db then did this!");
    console.log("With errors: "+err);

    db.collection("urls").find().toArray((err, urls) => {


      res.render("urls_index", {urls: urls});

    });
  });




});


app.get("/urls/new", (req, res) => {
  console.log("GET /urls_new");
  res.render("urls_new");

});

//EXAMPLE one//////////////////////////////
// app.get("/urls/:key/edit", (req, res) => {
//   var templateVars1 = {
//     longURL: urlDatabase[req.params.key],
//     key: req.params.key
//   };
//   res.render("urls_show", templateVars1);
// });
///////////////////////////////////////////

app.get("/urls/:id/edit", (req, res) => {
  let shortURL = req.params.id;
  getLongURL(dbInstance, shortURL, (err, longURL) => {
    console.log(longURL);
    // the longURL available in a callback function

  });
});


app.put("/urls/:key/edit", (req, res) =>{
    urlDatabase[req.params.key] = req.body.longURL;
    console.log(urlDatabase);
    res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log("POST /urls", req.body)
  var theShortURL = generateRandomString();
  var userEnterURL = req.body.longURL;
  urlDatabase[theShortURL] = userEnterURL;
  console.log(urlDatabase);
 res.redirect('urls/shortURL');

});

app.delete("/urls/:key", (req, res) => {
   var deleteKey = req.params.key;
   delete urlDatabase[deleteKey];
   res.redirect("/urls");
});

// app.put("urls/:key", (req, res) => {
//     var editKey = req.params.key
// });

app.get("/urls/shortURL", (req, res) => {
  console.log(Object.keys(urlDatabase));
  var length = Object.keys(urlDatabase).length - 1;
  var theShortenedURL = Object.keys(urlDatabase)[length];
  res.render('urls_create', {shortURL: theShortenedURL});
});

app.get("/u/:shortURL", (req, res) => {
  var longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});