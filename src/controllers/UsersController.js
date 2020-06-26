const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fetch = require('node-fetch')
const generateBearerToken = require('../util/generateBearerToken')

//Controller pour User
let UserController = {

    //Créé un User

    create: function (req, res) {

        let erreurs = [];


        if(!req.session.twitter_subscribe){

            let repassword = req.body.inputPasswordC;
            let password = req.body.inputPassword;
            let userEmail = req.body.inputEmail;
            let userPseudo = req.body.inputPseudo;

            //Vérifie si l'email existe déjà


            if (password !== repassword) {
                erreurs.push('Les mots de passe ne correspondent pas.');
            }

            bcrypt.hash(password, saltRounds, function (err, hash) {
                //Creation de User
                let user = new User();
                user.pseudo = userPseudo;
                user.email = userEmail;
                user.password = hash;

                user.save(function (err) {
                    if (err) {
                        Object.values(User.catchErrors(err)).forEach((error) => erreurs.push(error))
                    }
        
                    if (erreurs.length > 0) {
                        res.render("form-sign.ejs", { erreurs: erreurs });
                        return;
                    } else {
                        req.session.success = true;
                        res.redirect("/connexion");
                        return;
                    }
                });
            });
        }else{
            let user = new User();
            user.pseudo = req.session.pseudo_twitter;
            user.pseudo_twitter = req.session.pseudo_twitter;
            user.email = req.body.inputEmail;
            user.password = "TWITTER_PASSWORD_ACCOUNT"
            user.save((err)=>{
                if(err){
                    Object.values(User.catchErrors(err)).forEach((error) => erreurs.push(error))
                    console.log("errors",erreurs)
                    req.session.errorForms = erreurs;
                    res.redirect("/form-sign");
                }else{
                    req.session.userData = user;
                    res.redirect("/")
                }

            })
        }

    },

    connect: function (req, res) {

        const identifier = req.body.identifiant;
        const password = req.body.password;
        const erreurs = [];

        //L'identifiant peut être un pseudo ou email
        User.find().or([{ pseudo: identifier }, { email: identifier }])
            .then(users => {
                if (users.length === 0) {
                    erreurs.push('Vérifiez vos identifiants');
                    res.render("connexion.ejs", { erreurs: erreurs });
                } else {
                    //Vérification du mot de passe

                    bcrypt.compare(password, users[0].password, async function (err, result) {
                        if (result == true) {
                            //Variables de session "connecté", informations de l'utilisateur
                            req.session.connected = true;
                            req.session.userData = users[0];
                            //Générer le bearer token
                            let bearerToken = await generateBearerToken();
                            //Variable de session "bearerToken"
                            req.session.bearerToken = bearerToken;
                            //Redirection vers l'acceuil pour utilisateur connecté
                            res.redirect('/')
                        } else {
                            erreurs.push('Mot de passe incorrect');
                            res.render("connexion.ejs", { erreurs: erreurs });
                        }
                    });

                }
            })
            .catch(error => {
                erreurs.push('Erreur lors de la connexion');
                res.render("connexion.ejs", { erreurs: erreurs });
            });
    },


    showEdit: (req, res) => {
        let error = {
            email: "",
            pseudo: "",
            old_password: "",
            password: "",
            conf_password: "",
            pseudo_twitter: ""
        }

        let data = {
            email: req.session.userData.email,
            pseudo: req.session.userData.pseudo,
            pseudo_twitter: req.session.userData.pseudo_twitter
        }

        console.log(data)
        if (req.session.hasOwnProperty("errors")) {
            error = req.session.errors;
            if (req.session.hasOwnProperty("previous")) {
                data.email = req.session.previous.email;
                data.pseudo = req.session.previous.pseudo;
                data.pseudo_twitter = req.session.previous.pseudo_twitter;
                delete req.session.previous;
            }
            delete req.session.errors;

        }
        console.log(data)
        res.render("modifier-mon-compte.ejs", { error, user: data })
    },

    edit: (req, res) => {
        const errors = {
            email: "",
            pseudo: "",
            pseudo_twitter: "",
            old_password: "",
            password: "",
            conf_password: ""
        }

        let update = true;
        if(!req.session.twitter_subscribe){
        if (req.body.old_password.length > 0) {
            if (req.body.password.length == 0) {
                errors.password = "Vous devez saisir votre nouveau mot de passe"
            }
            if (req.body.password != req.body.conf_password){
                errors.conf_password = "Les deux mots de passe ne correspondent pas"
            }
            if(!bcrypt.compareSync(req.body.old_password,req.session.userData.password))
                errors.old_password = "Le mot de passe fourni est invalide"
            else if(bcrypt.compareSync(req.body.password,req.session.userData.password))
                errors.password = "Le nouveau mot de passe est identique par rapport à l'ancien"

        } else if (req.body.password.length > 0 || req.body.conf_password.length > 0) {
            errors.old_password = "Vous devez spécifier votre mot de passe"
        }

        if (req.body.pseudo_twitter.length > 0) {
    
            fetch("https://api.twitter.com/labs/2/users/by/username/" + req.body.pseudo_twitter, {
                method: "GET",
                headers: {
                    "Authorization": req.session.bearerToken
                }
            }).then(res => res.json())
                .then((json) => {
                    console.log(json)
                    if (json.hasOwnProperty("errors")){
                        if (json.errors[0].title === 'Not Found Error') 
                            errors.pseudo_twitter = "Ce compte Twitter n'existe pas";  
                    }
                    if(json.title === 'Invalid Request')
                        errors.pseudo_twitter = "Format donné invalide ^[A-Za-z0-9_]{1,15}$"  
                    
                    checkForm(req,res,errors,update);

                });
        } else 
            checkForm(req,res,errors,update);
    }else{
        if(req.session.userData.email == req.body.email)
        {
            errors.email = "L'adresse mail saisie est identique"
        }
        checkForm(req,res,errors,update);
    }
        
    },
    logout: function (req, res) {
        req.session.destroy(function (error) {
            if (error) {
                res.send("500 Server Error !");
            }
            else {
                res.redirect('/connexion');
            }
        });
    },

    async getUserTweet(pseudo,token) {
        console.log('token : ',token)
        let response = await fetch("https://api.twitter.com/1.1/search/tweets.json?q=from:" + pseudo+"&tweet_mode=extended", {
            method: "GET",
            headers: {
                "Authorization": token
            }
        })
        let data = await response.json();


            return data;
    },

    delete: (req,res) => {
        User.findOneAndDelete({ pseudo: req.session.userData.pseudo },(err,data) => {
            if(!err){
                req.session.deleteSuccess = true;
                res.redirect("/connexion");
            }
        })
    }
}


const checkForm = (req,res,errors,update) => {
    Object.values(errors).forEach((value) => {
        if (value != "") {
            update = false;
            return;
        }
    })  
    console.log(errors)
    if(!req.session.twitter_subscribe){
        const newData = { //on récupère les nouvelles valeurs, sinon on reste avec les valeurs initiales pour la mise à jour (sorte de patch)
            email: req.body.email.length > 0 ? req.body.email : req.session.userData.email,
            pseudo: req.body.pseudo.length > 0 ? req.body.pseudo : req.session.userData.pseudo,
            password: req.body.password.length > 0 ? req.body.password : req.session.userData.password,
            pseudo_twitter: req.body.pseudo_twitter
        }

        if(newData.pseudo_twitter.length == 0)
            delete newData.pseudo_twitter;
        console.log(req.session.userData.email)
        User.findOneAndUpdate({ email: req.session.userData.email }, newData, { new: true, runValidators: true, context: "query" }, (err, user) => {
            
            if (err != null || !update) {
                const { pseudo, email } = User.catchErrors(err); //erreurs qui ne peuvent qu'intervenir depuis Mongoose
                console.log(pseudo, email)
                errors.email = (email.length == 0) ? "" : email;
                errors.pseudo = (pseudo.length == 0) ? "" : pseudo;
                req.session.previous = {};
                req.session.previous["email"] = req.body.email;
                req.session.previous["pseudo"] = req.body.pseudo;
                req.session.previous["pseudo_twitter"] = req.body.pseudo_twitter;
                console.log(req.session.previous)
                req.session.errors = errors;
                res.redirect("/modifier-mon-compte")
            } else {
                req.session.userData.email = newData.email;
                req.session.userData.pseudo = newData.pseudo;
                req.session.userData.password = newData.password;
                req.session.userData.pseudo_twitter = newData.pseudo_twitter;
                req.session.success = "Votre compte a bien été mis à jour !"
                res.redirect("/mon-compte");
            }
        })
    }else{
        const newData = { //on récupère les nouvelles valeurs, sinon on reste avec les valeurs initiales pour la mise à jour (sorte de patch)
            email: req.body.email.length > 0 ? req.body.email : req.session.userData.email,
            pseudo: req.session.userData.pseudo,
            password: req.session.userData.password,
            pseudo_twitter: req.session.userData.pseudo
        }
        User.findOneAndUpdate({ email: req.session.userData.email }, newData, { new: true, runValidators: true, context: "query" }, (err, user) => {
            if(err != null)
            {
                console.log(newData)
                const { email } = User.catchErrors(err)
                req.session.previous = {};
                errors.email = (email.length == 0) ? "" : email;
                req.session.previous["email"] = newData.email;
                req.session.errors = errors;
                res.redirect("/modifier-mon-compte")
            }else{
                req.session.userData.email = req.body.email;
                req.session.success = "Votre compte a bien été mis à jour !"
                res.redirect("/mon-compte");
            }
        });
    }
}

module.exports = UserController;