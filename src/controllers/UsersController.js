const User = require('../models/UserModel');
const bcrypt = require('bcrypt');

const saltRounds = 10;



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

        User.find({ 'email': userEmail }, function (err, usr) {
            if (usr.length > 0) {
                //Si le mail est déjà utilisé
                erreurs.push('Cet email est utilisé pour un autre compte');
            }
        });

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
                    erreurs.push(err.errors.pseudo.message);
                }
    
                if (erreurs.length > 0) {
                    res.render("form-sign.ejs", { erreurs: erreurs });
                    return;
                } else {
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
            conf_password: ""
        }

        let data = {
            email: req.session.user.email,
            pseudo: req.session.user.pseudo
        }

        console.log(data)
        if (req.session.hasOwnProperty("errors")) {
            error = req.session.errors;
            if (req.session.hasOwnProperty("previous")) {
                data.email = req.session.previous.email;
                data.pseudo = req.session.previous.pseudo;
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
            old_password: "",
            password: "",
            conf_password: ""
        }

        let update = true;

        if (req.body.old_password.length > 0) {
            if (!bcrypt.compareSync(req.body.old_password, req.session.user.password)) {
                errors.old_password = "Le mot de passe fourni est invalide"
            }
            if (req.body.password.length == 0) {
                errors.password = "Vous devez saisir votre nouveau mot de passe"
            }
            if (req.body.password == req.session.user.password) {
                errors.password = "Le nouveau mot de passe est identique par rapport à l'ancien"
            } else if (req.body.password != req.body.conf_password)
                errors.conf_password = "Les deux mots de passe ne correspondent pas"
        } else if (req.body.password.length > 0 ||  req.body.conf_password.length > 0) {
            errors.old_password = "Vous devez spécifier votre mot de passe"
        }
        Object.values(errors).forEach((value) => {
            if (value != "") {
                update = false;
                return;
            }
        })

        if (update) { //on vérifie qu'il n'y a pas d'erreurs
            const newData = { //on récupère les nouvelles valeurs, sinon on reste avec les valeurs initiales pour la mise à jour (sorte de patch)
                email: req.body.email.length > 0 ? req.body.email : req.session.user.email,
                pseudo: req.body.pseudo.length > 0 ? req.body.pseudo : req.session.user.pseudo,
                password: req.body.password.length > 0 ? req.body.password : req.session.user.password
            }
            console.log(req.session.user.email)
            User.findOneAndUpdate({ email: req.session.user.email }, newData, { new: true, runValidators: true, context: "query" }, (err, user) => {

                if (err != null) {
                    const { pseudo, email } = User.catchErrors(err); //erreurs qui ne peuvent qu'intervenir depuis Mongoose
                    console.log(pseudo, email)
                    errors.email = (email.length == 0) ? "" : email;
                    errors.pseudo = (pseudo.length == 0) ? "" : pseudo;
                    req.session.previous = {};
                    req.session.previous["email"] = req.body.email;
                    req.session.previous["pseudo"] = req.body.pseudo;
                    console.log(req.session.previous)
                    req.session.errors = errors;
                    res.redirect("/modifier-mon-compte")
                } else {
                    req.session.user.email = newData.email;
                    req.session.user.pseudo = newData.pseudo;
                    req.session.user.password = newData.password;
                    req.session.success = "Votre compte a bien été mis à jour !"
                    res.redirect("/mon-compte");
                }
            })

        } else {
            req.session.errors = errors;
            res.redirect("/modifier-mon-compte");
        }
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

    }

}

module.exports = UserController;