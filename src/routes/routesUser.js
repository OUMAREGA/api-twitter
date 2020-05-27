const express = require('express');
const UserController = require('../controllers/UsersController');

//Routes for User
let UserRoutes = function(app)
{
    let router = express.Router();

    router.route('/sign-users')
    .post(UserController.create);

    router.route('/user-connexion')
    .post(UserController.connect);

    router.route('/logout')
    .post(UserController.logout);

    return router;
}

module.exports = UserRoutes;