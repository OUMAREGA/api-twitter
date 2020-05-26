const express = require('express');
const UserController = require('../controllers/UsersController');

//Routes for User
let UserRoutes = function(app)
{
    let router = express.Router();

    router.route('/sign-users')
    .post(UserController.create);
    return router;
}

module.exports = UserRoutes;