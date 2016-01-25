var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    relationship = require("mongoose-relationship");

var User = new Schema({
    children: [{ type:Schema.ObjectId, ref:"Punch" }]
});

var options = ({
    missingPasswordError: "Wrong password"
});

User.plugin(passportLocalMongoose,options);

module.exports = mongoose.model('User', User)
