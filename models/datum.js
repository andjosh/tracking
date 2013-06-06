/**
  * Datum: A piece of data, complete with person and category
  *
  */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Datum = new Schema({
    quantity: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, required: true },
    account: { type: Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('Datum', Datum);