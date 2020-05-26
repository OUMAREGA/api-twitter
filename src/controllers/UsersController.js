const User = require('../models/UserModel');
const crypto = require('crypto');

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
        User.find({ "email": userEmail }, function (err, usr) {
            if (usr.length > 0) {
                //Si le mail est déjà utilisé
                erreurs.push('Cet email est utilisé pour un autre compte');
                res.render("form-sign.ejs", { erreurs: erreurs });
                return;
            }
            else {
                //Vérifie si les mots de passe sont égaux
                if (password != repassword) {
                    erreurs.push('Les mots de passe ne correspondent pas.');
                    res.render("form-sign.ejs", { erreurs: erreurs });
                    return;
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
                user.validate(function (err) {
                    console.log(req.body);
                    if (err) {
                        erreurs.push(err);
                        res.render("form-sign.ejs", { erreurs: erreurs });
                        return;

                    } else {
                        //Sauvegarde User
                        user.save(function (err) {
                            if (err) {
                                erreurs.err = err;
                                res.render("form-sign.ejs", { erreurs: erreurs });
                                return;
                            }
                            res.redirect('/connexion');
                        });
                    }
                });
            }
        });
    },

    connect: function (req, res) {

        const identifier = req.body.identifiant;
        const password = req.body.password;

        const erreurs = [];

        User.find().or([{ pseudo: identifier }, { email: identifier }])
        .then(users => { 
            if (users.length > 0) {

                //Generation d'un Password hash basé sur sha1
                let shasum = crypto.createHash('sha1');
                shasum.update(password);
                let passwordHash = shasum.digest('hex');

                console.log(users);

                console.log(passwordHash);
                console.log(users[0].password);

                res.send("test");
            } else {
                erreurs.push('Vérifiez vos identifiants');
                res.render("connexion.ejs", {erreurs: erreurs});
            }
        })
        .catch(error => { res.send(error) });
    }

}

module.exports = UserController; 