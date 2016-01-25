var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require("mongoose-relationship");

var Punch = new Schema({
    punchin: Boolean,
    date: { type: Date, default: Date.now},
    user: { type: Schema.ObjectId, ref: "User", childPath: "punches" }
});
Punch.plugin(relationship, { relationshipPathName: 'user' });

module.exports = mongoose.model('Punch', Punch);
