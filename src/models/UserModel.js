const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Schema de User
var UserSchema = new Schema({
    pseudo: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: tue
    },
    password: {
        type: String,
        required: true
    }
});

//Definition du model
let User;
if(mongoose.models.User)
    User = mongoose.model('User');
else
    User = mongoose.model('User', UserSchema);

//Export du model
module.exports = User;