const mongoose = require("mongoose")
const Schema = mongoose.Schema

const StatsKeywordSchema = new Schema({
    keyword: {
        type: String,
        required: true
    },
    nb_tweets: {
        type: Number,
        default: 0,
        validate: {
            validator: (value) => {
                if (value > 0)
                    return Promise.resolve(true)
                else
                    return Promise.resolve(false)
            },
            message: "Valeur incorrecte"
        }
    },
    date: {
        type: Date,
        required: true
    }
})

mongoose.model('StatsKeyword', StatsKeywordSchema);

module.exports = mongoose.model('StatsKeyword');