var passport = require('passport')
    , Account = require('../models/account')
    , Datum = require('../models/datum')
    , Category = require('../models/category');
/*
 * API controller
 */
exports.viewAccount = function(req,res) {
	Account.findOne({key: req.params.key},'email username birthdate locaiton occupation joined', function(err, account){
		if (account){
			Datum.find({account:req.params.account},'quantity category categoryName date',{sort: '-date'}, function(err, data){
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write('['+JSON.stringify(account)+','+JSON.stringify(data)+']');
				res.end();
			})
		}
		if (!account){
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write('{"error":"No account or you are not authorized."}');
			res.end();
		}
	})
};

exports.viewCategory = function(req,res) {
	Category.findById(req.params.category,'name', function(err, category){
		Datum.find({category:req.params.category},'quantity category categoryName date account',{sort: '-date'}, function(err, data){
			Account.populate(data, {path: 'account', select: 'location birthdate occupation gender'}, function(err, data){
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write('['+JSON.stringify(category)+','+JSON.stringify(data)+']');
				res.end();
			})

		})
	})
};