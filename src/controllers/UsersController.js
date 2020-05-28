const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const fetch = require('node-fetch')


//Controller pour User
let UserController = {

    //Créé un User

    create: function (req, res) {

        let repassword = req.body.inputPasswordC;
        let password = req.body.inputPassword;
        let userEmail = req.body.inputEmail;
        let userPseudo = req.body.inputPseudo;
        let erreurs = [];

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

                    bcrypt.compare(password, users[0].password, function (err, result) {

                        if (result == true) {
                            req.session.connected = true;
                            req.session.userData = users[0];
                            res.redirect('/');
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

        } else if (req.body.password.length > 0 ||  req.body.conf_password.length > 0) {
            errors.old_password = "Vous devez spécifier votre mot de passe"
        }
        Object.values(errors).forEach((value) => {
            if (value != "") {
                update = false;
                return;
            }
        })  
            console.log(errors)
            const newData = { //on récupère les nouvelles valeurs, sinon on reste avec les valeurs initiales pour la mise à jour (sorte de patch)
                email: req.body.email.length > 0 ? req.body.email : req.session.userData.email,
                pseudo: req.body.pseudo.length > 0 ? req.body.pseudo : req.session.userData.pseudo,
                password: req.body.password.length > 0 ? req.body.password : req.session.userData.password,
                pseudo_twitter: req.body.pseudo_twitter.length > 0 ? req.body.pseudo_twitter : req.session.userData.pseudo_twitter
            }
            console.log(req.session.userData.email)
            User.findOneAndUpdate({ email: req.session.userData.email }, newData, { new: true, runValidators: true, context: "query" }, (err, user) => {

                if (err != null) {
                    const { pseudo, email, pseudo_twitter } = User.catchErrors(err); //erreurs qui ne peuvent qu'intervenir depuis Mongoose
                    console.log(pseudo, email)
                    errors.email = (email.length == 0) ? "" : email;
                    errors.pseudo = (pseudo.length == 0) ? "" : pseudo;
                    errors.pseudo_twitter = (pseudo_twitter.length == 0) ? "" : pseudo_twitter;
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

    },
    logout: function(req, res){
        req.session.destroy(function(error){  
            if(error){  
                res.send("500 Server Error !");
            }  
            else  
            {  
                res.redirect('/connexion');  
            }  
        });  
    },

     async getUserTweet(pseudo){
        let response = await fetch("https://api.twitter.com/1.1/search/tweets.json?q=from:"+pseudo, {
        method: "GET",
        headers: {
            "Authorization": process.env.TOKEN
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

module.exports = UserController;