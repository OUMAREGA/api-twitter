const keywordController = require('../controllers/KeywordController');

module.exports = (app) => {
    app.route('/keywords/:word')
    .post(keywordController.add_keyword)
    .delete(keywordController.delete_keyword);

    app.route('/keywords')
    .get(keywordController.get_keywords);
    
};