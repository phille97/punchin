var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({});

var options = ({
    missingPasswordError: "Wrong password"
});

User.plugin(passportLocalMongoose,options);

module.exports = mongoose.model('User', User)
