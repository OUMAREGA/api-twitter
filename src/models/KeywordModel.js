const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-beautiful-unique-validation');

let KeywordSchema = new Schema({
    word: {
        type: String,
        required: true,
        unique: "Le mot clé existe déjà"
    },
    users: [{
        pseudo: String,
        date_ajout: Date,
    }]
});

KeywordSchema.plugin(uniqueValidator);

mongoose.model('Keyword', KeywordSchema);

module.exports = mongoose.model('Keyword');