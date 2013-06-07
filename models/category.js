/**
  * Category: A relative grouping, owning data
  *
  */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Category = new Schema({
    name: { type: String },
    data: [{ type: Schema.Types.ObjectId, ref: 'Datum' }]
});

module.exports = mongoose.model('Category', Category);