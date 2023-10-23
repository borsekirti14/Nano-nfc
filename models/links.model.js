const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const ModelUser = require('../models/usersData.model');
let Schema = mongoose.Schema;

const urls = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
  urlArray:{type:Array},
  assignedUser:{type: Schema.Types.ObjectId, ref: 'ModelUser'}
})

module.exports = mongoose.model('urlData', urls);
