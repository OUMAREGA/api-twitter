const keywordController = require('../controllers/KeywordController');

module.exports = (app) => {
    app.route('/keywords/:word')
    .delete(keywordController.delete_keyword)
    .get(keywordController.get_a_keyword);

    app.route('/keywords')
    .get(keywordController.get_keywords)
    .post(keywordController.add_keyword)
    
};