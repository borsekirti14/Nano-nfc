const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');


const UserSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	email: {type: String, required: true,unique: true},
	password: {type: String},
	name: {type: String},
	secret : {type:Array,required:true},
	DummyAccount :{type:String,required:true,default:"Y"},
	resetPasswordToken : {type: String},
	confirmToken : {type: String}
},
{timestamps: true});
UserSchema.index({email:1})

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) { return cb(err); }

    cb(null, isMatch);
  });
};

module.exports = mongoose.model('usersData', UserSchema);
