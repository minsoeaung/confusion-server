var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    facebookId: String,
    admin: {
        type: Boolean,
        default: false
    }
})


/*
    passport-local-mongoose is a mongoose plugin that simplifies building username and password login with passport
    can freely define User
    The plugin will add a username, hash and salt automatically
    It also adds some methods to the Schema

    Supported by implementing
        LocalStrategy
        serializeUser/deserializeUser functions
*/

// can have some additional options as second parameter
User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User)