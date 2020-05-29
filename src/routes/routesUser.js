const express = require('express');
const UserController = require('../controllers/UsersController');

const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const middleware = require('../controllers/AuthMiddleware')



//Routes for User
let UserRoutes = function(app) 
{
    let router = express.Router();

    router.route('/sign-users')
    .post(UserController.create);

    router.route('/user-connexion')
        .post(UserController.connect);


    router.route("/modifier-mon-compte")
        .get([middleware],UserController.showEdit)
        .post([middleware],UserController.edit)

    router.get('/mon-compte', [middleware], function(req, res) {
        let success = ""; //si la mise à jour a réussi
        if (req.session.hasOwnProperty("success")) {
            success = req.session.success;
            delete req.session.success;
        }
        res.render("profile.ejs", { success: success, pseudo:  req.session.userData.pseudo, pseudo_twitter: req.session.userData.pseudo_twitter, email: req.session.userData.email})
    })


    router.route('/logout')
    .get(UserController.logout);

    router.get("/delete-account", UserController.delete)

    return router;
}

module.exports = UserRoutes;