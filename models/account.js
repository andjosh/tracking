/**
  * Account: A person, owning data
  *
  */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    location: String,
    occupation: String,
    gender: String,
    birthdate: Date,
		key: { type: String, default: ( Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) ) },
    joined: { type: Date, default: Date.now },
    accessToken: String // Used for Remember Me
});

Account.plugin(passportLocalMongoose, {usernameField: 'email'});

module.exports = mongoose.model('Account', Account);

// Remember Me implementation helper method
Account.methods.generateRandomToken = function () {
  var user = this,
      chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      token = new Date().getTime() + '_';
  for ( var x = 0; x < 16; x++ ) {
    var i = Math.floor( Math.random() * 62 );
    token += chars.charAt( i );
  }
  return token;
};
