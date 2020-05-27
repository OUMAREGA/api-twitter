const express = require('express');
const UserController = require('../controllers/UsersController');

const User = require("../models/UserModel");
const bcrypt = require("bcrypt");

//Routes for User
let UserRoutes = function(app) 
{
    let router = express.Router();

    router.route('/sign-users')
        .post(UserController.create);
    router.route('/user-connexion')
        .post(UserController.connect);


    router.route("/modifier-mon-compte")
        .get(UserController.showEdit)
        .post(UserController.edit)

    router.get('/mon-compte', function(req, res) {
        let success = ""; //si la mise à jour a réussi
        if (req.session.hasOwnProperty("success")) {
            success = req.session.success;
            delete req.session.success;
        }
        res.render("profile.ejs", { success: success })
    })


    return router;
}

module.exports = UserRoutes;