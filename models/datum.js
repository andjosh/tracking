/**
  * Datum: A piece of data, complete with person and category
  *
  */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Datum = new Schema({
    quantity: { type: Number },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
		categoryName: { type: String },
    account: { type: Schema.Types.ObjectId, ref: 'Account' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Datum', Datum);