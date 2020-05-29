const keywordController = require('../controllers/KeywordController');
const APImiddleware = require('../controllers/APIMiddleware');

module.exports = (app) => {
    app.route('/keywords/:word')
    .delete([APImiddleware], keywordController.delete_keyword)
    .get([APImiddleware], keywordController.get_a_keyword);

    app.route('/keywords')
    .get([APImiddleware], keywordController.get_keywords)
    .post([APImiddleware], keywordController.add_keyword);
    
};