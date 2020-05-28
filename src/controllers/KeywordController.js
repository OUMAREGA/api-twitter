const Keyword = require('../models/KeywordModel');
const User = require('../models/UserModel');

exports.add_keyword = (req, res) => {
    const word = req.params.word.toLowerCase();

    //test avec req.body.pseudo
    const userPseudo = req.session.userData.pseudo;

    //On vérifie si le mot clé existe déjà
    Keyword.findOne({ word: word })
        .then(document => {
            if (document === null) {
                //Nouveau mot clé
                const new_keyword = new Keyword();
                new_keyword.word = word;
                const addDate = new Date(Date.now()).toISOString();
                const keywordUserObject = { pseudo: userPseudo, date_ajout: addDate };
                new_keyword.users = [keywordUserObject];

                new_keyword.save((err, keyword) => {
                    if (err) {
                        res.send(err);
                    } else {
                        res.status(201);
                        res.json({ message: "Mot clé crée" });
                    }
                });

            } else {
                //Mot clé existant
                const usersList = document.users;
                if (usersList.some(e => e.pseudo === userPseudo)) {
                    //Utilisateur déjà enregistré sur ce mot clé
                    res.json({ message: "Vous avez déjà enregistré ce mot clé" });
                } else {
                    const addDate = new Date(Date.now()).toISOString();
                    const keywordUserObject = { pseudo: userPseudo, date_ajout: addDate };

                    usersList.push(keywordUserObject);
                    document.save(function (err, keyword) {
                        if (err) {
                            POST
                            res.send(err);
                        } else {
                            res.status(200);
                            res.json({ message: "Mot clé ajouté" });
                        }
                    });

                }
            }
        })
}

exports.get_keywords = (req, res) => {
    //test avec req.body.pseudo
    const userPseudo = req.body.pseudo;//req.session.userData.pseudo;

    Keyword.find({ "users.pseudo": userPseudo })
        .then(result => {
            let userKeywords = [];

            result.forEach(element => {
                userKeywords.push(element.word);
            });

            res.json(userKeywords);
        });
}

exports.delete_keyword = (req, res) => {
    const word = req.params.word.toLowerCase();

    //test avec req.body.pseudo
    const userPseudo = req.body.pseudo;//req.session.userData.pseudo;

    Keyword.findOne({ word: word, "users.pseudo": userPseudo })
        .then(result => {
            if (result === null) {
                res.json({ message: "Vous n'avez pas ce mot clé" });
            } else {
                //Mot clé existant
                const usersList = result.users;

                usersList.splice(usersList.findIndex(item => item.pseudo === userPseudo), 1);

                if (usersList.length < 1) {
                    Keyword.deleteOne({ word: word }, function (err) {
                        if (err) {
                            res.json(err);
                        } else {
                            res.json({ message: "Mot clé supprimé" });
                        }
                    });
                } else {
                    result.save(function (err, keyword) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.status(200);
                            res.json({ message: "Mot clé supprimé" });
                        }
                    });
                }
            }
        });
}