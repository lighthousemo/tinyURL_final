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



console.log(`Connecting to MongoDB running at: ${MONGODB_URI}`);



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


app.get("/urls/:key/edit", (req, res) => {



  connectAndThen(function(err, db){

    console.log("Connected to db then edit this!");
    console.log("With errors: "+err);

    db.collection("urls").findOne({shortURL: req.params.key}, (err, url) => {

      res.render("urls_show", {url: url})

  });
});

});



app.post("/urls/:key/edit", (req, res) =>{

    connectAndThen(function(err, db) {

    console.log("Connected to db then update this url!");
    console.log("With errors: "+err);

    db.collection("urls").updateOne({shortURL: req.params.key}, {$set: {longURL: req.body.longURL}}, (err, url) => {


        res.redirect("/urls");
    })
  });
});


app.post("/urls", (req, res) => {

  var theShortURL = generateRandomString();
  var userEnterURL = req.body.longURL;

  var newUrl = {
    shortURL: theShortURL,
    longURL: userEnterURL
  }

  console.log("Attempting to insert new url: ", newUrl);

     connectAndThen(function(err, db) {

      console.log("Connected to db then tried to delete!");
      console.log("With errors: "+err);
      console.log(req.params.key);

        db.collection("urls").insert(newUrl, function (err, url) {
          if (err) res.status(500).json(err);
          res.render("urls_create", {url: newUrl});
        })

    });
});




app.delete("/urls/:key", (req, res) => {

   connectAndThen(function(err, db){

    console.log("Connected to db then tried to delete!");
    console.log("With errors: "+err);
    console.log(req.params.key);

    db.collection("urls").deleteOne({shortURL: req.params.key}, function (err) {
      console.log(err);


      res.redirect("/urls");
    })

  });


});




//redirect page
app.get("/u/:shortURL", (req, res) => {

  connectAndThen(function(err, db) {


    db.collection("urls").findOne({shortURL: req.params.shortURL}, function (err) {
      console.log(err);
      res.redirect(url);
    })
  });
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
