var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    profile_image: String,
    username: String,
    last_name: String,
    email: String,
    phone: String,
    bank_balance: String,
    password: String,
    
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);