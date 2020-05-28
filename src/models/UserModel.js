const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');


//Schema de User
let UserSchema = new Schema({
    pseudo: {
        type: String,
        required: "Un pseudo est requis",
        unique: true
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
            message: "Email non conforme"
        },
        unique: true
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
if (mongoose.models.User)
    User = mongoose.model('User');
else
    User = mongoose.model('User', UserSchema);

//Export du model
module.exports = User;

module.exports.catchErrors = (errorObject) => {
    const finalObject = {};
    Object.assign({}, ["pseudo", "email", "password", "pseudo_twitter"].forEach((attribute) => {
        if (errorObject !== null && errorObject.errors.hasOwnProperty(attribute) && errorObject.errors[attribute] !== undefined) {
            if (errorObject.errors[attribute].kind == "unique") {
                switch (attribute) {
                    case "pseudo":

                        finalObject[attribute] = "Ce pseudo est déjà utilisé"
                        break;

                    case "email":
                        finalObject[attribute] = "Cet email est déjà utilisé"
                        break;
                    case "pseudo_twitter":

                        finalObject[attribute] = "Ce pseudo twitter est déjà utilisé"
                        break;


                }
            } else {
                finalObject[attribute] = errorObject.errors[attribute].message
            }


        } else {
            finalObject[attribute] = ''
        }
    }));

    return finalObject;

}