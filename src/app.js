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
    secret: '',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

mongoose.connect("mongodb://mongo/api_twitter_BDD");

app.set("view engine", "ejs"); //règle pour associer le moteur de templating de express à ejs
app.set("views", "views"); //éviter de préciser le chemin de la vue, directement préciser le nom du fichier

app.use('/bs', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(userRoutes());

app.get('/', function(req, res) {
    res.render("index.ejs", { framework: "Bootstrap" })
})

app.get('/connexion', function(req, res) {
    res.render("connexion.ejs");
})

app.get('/form-sign', function(req, res) {
    res.render("form-sign.ejs", { framework: "Bootstrap" })
})

app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
})
