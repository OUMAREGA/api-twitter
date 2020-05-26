const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-beautiful-unique-validation');


//Schema de User
let UserSchema = new Schema({
    pseudo: {
        type: String,
        required: "Un pseudo est requis",
        unique: "Ce pseudo est déjà utilisé"
    },
    email: {
        type: String,
        required: "Une adresse email est requise",
        validate: { //validation du mail (invoquer validate())
            validator: (value) => {
                if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))
                    return Promise.resolve(true)
                else
                    return Promise.resolve(false)
            },
            message: "https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweetsEmail non conforme"
        },
        unique: "Cette adresse mail a déjà été utilisé"
    },
    password: {
        type: String,
        required: "Un mot de passe est requis"
    },
    pseudo_twitter: {
        type: String
    }
});

//personnalise les messages d'erreur
UserSchema.plugin(uniqueValidator)

//Definition du model
let User;
if(mongoose.models.User)
    User = mongoose.model('User');
else
    User = mongoose.model('User', UserSchema);

//Export du model
module.exports = User;