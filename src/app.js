const express = require('express')
const app = express()
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const userRoutes = require('./routes/routesUser');

var session = require('express-session');
const MongoStore = require('connect-mongo')(session);

mongoose.connect("mongodb://mongo/api_twitter_BDD");

app.use(session({
    secret: 'P)j5yBV(kShrY{*@',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

const bodyParser = require("body-parser");

const userRoutes = require('./routes/routesUser');
var session = require('express-session')

app.use(session({
    secret: 'P)j5yBV(kShrY{*@',
    resave: false,
    saveUninitialized: false,
  }))

mongoose.connect("mongodb://mongo/api_twitter_BDD");

app.set("view engine", "ejs"); //règle pour associer le moteur de templating de express à ejs
app.set("views", "views"); //éviter de préciser le chemin de la vue, directement préciser le nom du fichier

app.use('/bs', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(userRoutes());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(userRoutes());

app.get('/', function(req, res) {
    let data = [];

    data = [{
            "title": "Mon premier tweet",
            "text": "Ceci est ma première utilisation de Twiiter"
        },
        {
            "title": "Mon premier tweet",
            "text": "Ceci est ma première utilisation de Twiiter"
        }, {
            "title": "Mon premier tweet",
            "text": "Ceci est ma première utilisation de Twiiter"
        }
    ]

    res.render("index.ejs", {
        pseudo: "hello",
        tweets: data
    })
})
//Accède à la page inscription
app.get('/connexion', function(req, res) {
    res.render("connexion.ejs");
})
//Accède à la page connexion
app.get('/form-sign', function(req, res) {
    res.render("form-sign.ejs", { framework: "Bootstrap" })
})

app.get('/mon-compte', function(req, res) {
    res.render("profile.ejs", { framework: "Bootstrap" })
})
app.get('/modifier-mon-compte', function(req, res) {
    res.render("modifier-mon-compte.ejs", { framework: "Bootstrap" })
})

app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
})