const User = require('../models/UserModel');
const crypto = require('crypto');

//Controller pour User
let UserController = {

    //Créé un User
    create: function(req, res){
        let repassword = req.body.inputPasswordC;
        let password = req.body.inputPassword;
        let userEmail = req.body.inputEmail;
        let userPseudo = req.body.inputPseudo;
        let erreurs = [];

        //Vérifie si l'email existe déjà
        User.find({"email": userEmail}, function(err, usr) {
            if(usr.length > 0){
                //Si le mail est déjà utilisé
                erreurs.push('Cet email est utilisé pour un autre compte');
                res.render("form-sign.ejs", {erreurs: erreurs});
            }
            else
            {
                //Vérifie si les mots de passe sont égaux
                if(password != repassword){
                    erreurs.push('Les mots de passe ne correspondent pas.');
                    res.render("form-sign.ejs", {erreurs: erreurs});
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
                user.validate(function(err){
                    console.log(req.body);
                    if(err){
                        erreurs.push(err);
                        res.render("form-sign.ejs", {erreurs: erreurs});
                    }else{
                        //Sauvegarde User
                        user.save(function(err){
                            if(err)
                            {
                                erreurs.err = err;
                                res.render("form-sign.ejs", {erreurs: erreurs});
                            }
                            res.redirect('/connexion');
                        });
                    }
                });
             }
        });
    }

}

module.exports = UserController;