var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  email: { type: String, default: '', unique : true, required : true },
  password: { type: String, default: '', required : true }
});

mongoose.model('User', UserSchema);
