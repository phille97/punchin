var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require("mongoose-relationship");

var Punch = new Schema({
    in: { type: Date, default: Date.now},
    out: { type: Date, default: null},
    user: { type: Schema.ObjectId, ref: "User", childPath: "punches" }
});
Punch.plugin(relationship, { relationshipPathName: 'user' });

module.exports = mongoose.model('Punch', Punch);
