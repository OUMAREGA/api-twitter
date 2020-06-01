/*const Keyword = require('../models/KeywordModel');
const User = require('../models/UserModel');*/

const Stats = require('../models/StatsKeywordModel')

exports.create_keyword_stat = (req) => {
            try {
                let newStats = new Stats(req.body)

                newStats.save((error, stats) => {
                    if (error) {
                        return error;
                    }
                    else {
                       return stats;
                    }
                })
            } catch (e) {
                return e;
            }
}

exports.get_keywords_stat = (req, res) => {
    Stats.find({ keyword: req.params.keyword }, (error, stats) => {
        if (error) {
            res.status(500);
            res.json({ message: "Error Server" });
        }
        else {
            res.status(200);
            res.json(stats);
        }
    })
}

exports.get_date_stat_keyword = (req, res) => {

    let date = req.params.date;

    Stats.find({ keyword: req.params.keyword }).where('date').gte(date).exec(function (err, stats) {
      if (err)
      {
        res.status(500);
        res.json({ message: "Error Server" });
      }
     else
     {
        res.status(200);
        res.json(stats);
     }
    });
}