const StatsKeyController = require('../controllers/StatsKeywordController');

module.exports = (app) => {
    app.route('/stats/:keyword')
    .get(StatsKeyController.get_keywords_stat) // get all stats for keywords

    app.route('/stats')
    .post(StatsKeyController.create_keyword_stat);

    app.route('/stats/:keyword/:date')
    .get(StatsKeyController.get_date_stat_keyword); // get stats for keywords for one date

};