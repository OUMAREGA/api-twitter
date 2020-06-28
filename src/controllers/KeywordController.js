const Keyword = require('../models/KeywordModel');

exports.add_keyword = (req, res) => {
    const word = req.body.word.toLowerCase();

    //test avec req.body.pseudo
    const userPseudo = req.session.userData.pseudo;
    const token = req.session.bearerToken;

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
                        keyword = keyword.toObject();
                        delete keyword.users;
                        res.json({ keyword });
                    }
                });

            } else {
                //Mot clé existant
                const usersList = document.users;
                if (usersList.some(e => e.pseudo === userPseudo)) {
                    //Utilisateur déjà enregistré sur ce mot clé
                    res.status(409);
                    res.json({ message: "Vous avez déjà enregistré ce mot clé" });
                } else {
                    const addDate = new Date(Date.now()).toISOString();
                    const keywordUserObject = { pseudo: userPseudo, date_ajout: addDate };
                    usersList.push(keywordUserObject);
                    document.save(function (err, keyword) {
                        if (err) {
                            res.send(err);
                        } else {
                            keyword = keyword.toObject();
                            delete keyword.users;
                            res.status(200);
                            res.json({ keyword });
                        }
                    });

                }
            }
        })
}

exports.get_keywords = (req, res) => {
    //test avec req.body.pseudo
    const userPseudo = req.session.userData.pseudo;

    Keyword.find({ "users.pseudo": userPseudo })
        .then(result => {
            if (result.length === 0) {
                res.json({message:"Aucun mot clé associé pour cet utilisateur"});
            }else{
            let userKeywords = [];

            result.forEach(element => {
                element = element.toObject();
                let users = element.users;
                const reqUser = users.find(user => user.pseudo === userPseudo);
                element.user = reqUser;
                delete element.users;
                userKeywords.push(element);
            });

            res.json(userKeywords);
        }
        });
}

exports.delete_keyword = (req, res) => {
    const word = req.params.word.toLowerCase();

    //test avec req.body.pseudo
    const userPseudo = req.session.userData.pseudo;

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
                            res.status(200);
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

exports.get_a_keyword = (req, res) => {
    const word = req.params.word.toLowerCase();

    //test avec req.body.pseudo
    const userPseudo = req.session.userData.pseudo;

    Keyword.find({ "users.pseudo": userPseudo, word: word })
        .then(result => {
            if (result.length === 0) {
                res.json({ message: "Mot clé non trouvé pour cet utilisateur" });
            } else {
                result = result[0].toObject();

                const users = result.users;
                const userData = users.find(user => user.pseudo === userPseudo);

                result.user = userData;

                delete result.users;

                res.json(result);
            }
        });
}