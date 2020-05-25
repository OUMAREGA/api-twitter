const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let KeywordSchema = new Schema({
    word: {
        type: String,
        required: true
    },
    users: [{
        pseudo: String,
        date_ajout: Date,
    }]
});

mongoose.model('Keyword', KeywordSchema);

module.exports = mongoose.model('Keyword');