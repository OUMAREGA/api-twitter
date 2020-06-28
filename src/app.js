const express = require('express');
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require('./routes/routesUser');
const session = require('express-session');
const user = require('./controllers/UsersController');
const MongoStore = require('connect-mongo')(session);
const CronStoreStats =  require('./CronStoreStats');
const User = require("./models/UserModel");
const inspect = require("util-inspect")
const fs = require('fs');
const oauth = require("oauth");

const consumer = new oauth.OAuth("https://twitter.com/oauth/request_token",
"https://twitter.com/oauth/access_token",process.env.API_KEY,process.env.API_SECRET_KEY,"1.0A",
`http://localhost:3000/twitter/callback`,"HMAC-SHA1")

mongoose.connect("mongodb://mongo/api_twitter_BDD");

const middleware = require('./controllers/AuthMiddleware');
const statsRoute = require('./routes/routeStatsKeyword');
const Access = require('./controllers/AccessMiddleware');
const generateBearerToken = require('./util/generateBearerToken');
app.use(session({
    secret: 'P)j5yBV(kShrY{*@',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

app.set("view engine", "ejs"); //règle pour associer le moteur de templating de express à ejs
app.set("views", "views"); //éviter de préciser le chemin de la vue, directement préciser le nom du fichier
app.use('/bs', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use("/chart", express.static(__dirname + '/node_modules/chart.js/dist/'))
app.use("/assets", express.static(__dirname + '/public/'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
userRoutes(app);
statsRoute(app);

app.use((req,res,next)=>{ //utilisation d'un middleware pour pouvoir exposer des variables aux templates EJS
    
    /**
     * Les templates EJS sont renvoyés par la méthode render() de l'objet res
     * On peut aussi attacher d'autres variables depuis l'attribut "local" du même objet
     * Cela veut dire que ces variables seront visibles uniquement durant le moment
     * de la requête, en l'occurrence ici par les templates EJS, si la requête demande
     * bien sûr le rendu d'un template EJS
     */
    if(req.session.userData)
        res.locals.currentUser = req.session.userData;
    else
        delete res.locals.currentUser;


    if(req.session.twitter_subscribe)
        res.locals.twitter_subscribe = true; //va être utilisé dans form-sign.ejs et modifier-mon-compte.ejs (changer les champs des informations qui peuvent être changées)
    else
        res.locals.twitter_subscribe = null;


    if(req.session.errorForms) //exposer les erreurs des formulaires dans les templates EJS sans passer par la création de variables dans les actions des routes
        res.locals.errorForms = req.session.errorForms;
    else
        delete res.locals.errorForms;    

    next();
})

app.get('/',[middleware], function(req, res) {

    let pseudo = req.session.userData.pseudo
    
    if(req.session.userData && req.session.userData.pseudo_twitter)
    {
        let pseudo_twitter = req.session.userData.pseudo_twitter
        
            user.getUserTweet(pseudo_twitter,req.session.bearerToken).then(data =>
                {
                    if(data.statuses){
                        res.render("index.ejs", {
                            pseudo: pseudo,
                            pseudo_twitter: pseudo_twitter,
                            tweets: data.statuses
                        })
                    }else{
                        res.render("index.ejs",{
                            pseudo: pseudo,
                            pseudo_twitter: pseudo_twitter,
                            tweets: []
                        })
                    }
                    
                })
    }
    else
    {
        res.render("index.ejs", {
            pseudo:pseudo,
            pseudo_twitter:'',
            tweets: []
        })
    }
    
})

//gestion du cron
CronStoreStats.store();

//Accède à la page connexion
app.get('/connexion',[Access], function(req, res) {
    let subscribeOk = "";
    let deleteOk = "";
    if(req.session.hasOwnProperty("success")){
        subscribeOk = req.session.success;
        delete req.session.success;
    }else if(req.session.hasOwnProperty("deleteSuccess")){
        deleteOk = req.session.deleteSuccess;
        delete req.session.deleteSuccess;
    }
    res.render("connexion.ejs", { success : subscribeOk, delete_account: deleteOk });
})

app.get('/twitter/connect', function(req, res){    

    consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
      if (error) {
        res.send("Error getting OAuth request token : " + inspect(error), 500);
      } else {  
        req.session.oauthRequestToken = oauthToken;
        req.session.oauthRequestTokenSecret = oauthTokenSecret;
        res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);      
      }
    });
  });

  app.get('/twitter/callback', function(req, res){
    consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, result) {
      if (error) {
        res.send("Error getting OAuth access token : " + inspect(error) + "[" + oauthAccessToken + "]" + "[" + oauthAccessTokenSecret + "]" + "[" + inspect(result) + "]", 500);
      } else {
        req.session.oauthAccessToken = oauthAccessToken;
        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
        req.session.pseudo_twitter = result.screen_name;

        User.findOne({ pseudo: result.screen_name },async (error,user)=>{
            req.session.twitter_subscribe = true;
            if(!user){
                res.redirect("/form-sign")
            }else{
                let bearerToken = await generateBearerToken();
                //Variable de session "bearerToken"
                req.session.bearerToken = bearerToken;
                req.session.userData = user;
                res.redirect('/');
            }
        })

      }
    });
  });

//Accède à la page inscription
app.get('/form-sign',[Access], function(req, res) {
    res.render("form-sign.ejs")
})

app.get("/dashboard",[middleware],(req,res) => {

    res.render("dashboard.ejs")
})

app.get('/modifier-mon-compte', [middleware], function(req, res) {
    res.render("modifier-mon-compte.ejs")

})

const routesKeyword = require('./routes/routesKeyword');
routesKeyword(app);


app.listen(3000);

