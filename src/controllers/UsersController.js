const User = require('../models/UserModel');
const crypto = require('crypto');

//Controller pour User
let UserController = {

    //Créé un User
    create: function(req, res) {
        let repassword = req.body.inputPasswordC;
        let password = req.body.inputPassword;
        let userEmail = req.body.inputEmail;
        let userPseudo = req.body.inputPseudo;
        let erreurs = [];

        //Vérifie si l'email existe déjà


        //Vérifie si les mots de passe sont égaux
        if (password != repassword) {
            erreurs.push('Les mots de passe ne correspondent pas.');
        }

        //Generation d'un Password hash basé sur sha1
        let shasum = crypto.createHash('sha1');
        shasum.update(req.body.inputPassword);
        let passwordHash = shasum.digest('hex');

        //Creation de User
        let user = new User();
        user.pseudo = userPseudo;
        user.email = userEmail;
        user.password = passwordHash;

        //Validation


        user.validate(function(err) {
            console.log(err.errors)
            console.log(req.body);
            if (err) {
                erreurs.push(err);
            }
            //Sauvegarde User
            user.save(function(err) {

                if (err) {
                    erreurs.push(err);
                    res.render("form-sign.ejs", { erreurs: erreurs });
                    return;
                }
                res.redirect('/connexion');
            });

        });

    }

}

module.exports = UserController;