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
    }

}

module.exports = UserController;

