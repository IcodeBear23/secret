//jshint esversion:6
// Step 9 Import dotenv for environment variables
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

// Step 1 connect to mongod database
mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

// Step 2 create a schema for the collection
// Step 6 Recreate the schema for mongoose-encryption
// Now it is a object from mongoose Schema class
const userSchema = new mongoose.Schema({
    email: String,
    password: String    
});

// Step 7 Define the long STRING to a constant And use this constant to encrypt database
// const secret = "Thisisourlittlesecret.";

// Step 8 Define the encryption method
// only encrypt the password because we need email to find the user
// STEP 10 the "secret" variable has been saved into the .env file, we no longer need it here
userSchema.plugin(encrypt, {
    // secret: secret, 
    secret: process.env.SECRET,
    encryptedFields: ["password"]
});

// Step 3 create a model for the collection
const User = mongoose.model("User", userSchema);

// Step 4 create a document by getting the post request with bodyParser from register.ejs
app.post("/register", function(req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    // REMEMBER TO SAVE THE NEW USER TO THE DATABASE
    newUser.save()
        .then(() => {
            // !!Only render "success page" if the user is successfully registered
            res.render("secrets");
        })
        .catch((err) => {
            console.log(err);
        });
});

// Step 5 getting the post request with bodyParser from login.ejs 
// Try and check the user info with the database
app.post("/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    // "email" is the constant that save username in database
    User.findOne({email: username})
        // "user": is the matching document that found in database
        .then((user) => {
            if(user.password === password) {
                res.render("secrets");
            }
        })
        .catch((err) => {
            console.log(err);
        });
});


app.listen(3000,function() {
    console.log("Server started on port 3000"); 
});