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
			Datum.find({account:account._id},'quantity category categoryName date',{sort: '-date'}, function(err, data){
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write('{"account":'+JSON.stringify(account)+',"dataCount":'+data.length+', "data":'+JSON.stringify(data)+'}');
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
				res.write('{"category":'+JSON.stringify(category)+',"data":'+JSON.stringify(data)+'}');
				res.end();
			})
		})
	})
};

exports.allCategories = function(req,res){
	Category.find(null, 'name', function(err, categories){
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.write('{"count":'+categories.length+', "categories":'+JSON.stringify(categories)+'}');
		res.end();
	})
}

exports.deleteDatum = function(req,res){
	Account.findOne({key: req.params.key},'email username birthdate locaiton occupation joined', function(err, account){
		if (account){
			var conditions = { _id: req.params.id };
			Datum.remove(conditions, function upDated(err) {
				if(err) {
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.write('{"error":"There was a problem accessing that datum."}');
					res.end();
				}
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write('{"success":"Datum '+req.params.id+' successfully removed."}');
				res.end();
			});
		}
		if (!account){
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write('{"error":"No account or you are not authorized."}');
			res.end();
		}
	})
}

exports.makeDatum = function(io){
	return function(req,res){
		Account.findOne({key: req.params.key},'key', function(err, account){
			if (account){
				Category.findOne({'name': req.body.category}, function(err, categoryFound) {
					if (err) { return next(err); }
					if (!categoryFound) {
						// Create category and datum, redirect/return
						var newCategory = new Category();
						newCategory.name = req.body.category;
						// Add datum here
						newCategory.save(function(err, resultCategory){
							if(err) {
								throw err;
							}
							console.log(resultCategory.name+' category created')
							// Emit the new categories for all to use
							Category.find( function foundCategories(err, categories) {
								var catList = [];
								categories.forEach(function(cat) {
									catList.push('"'+cat.name+'"')
								});
								io.sockets.emit('newCategories', { names: catList });
							});
						});
						var newDatum = new Datum();
						newDatum.quantity = req.body.quantity;
						newDatum.category = newCategory._id;
						newDatum.categoryName = newCategory.name;
						newDatum.account  = account._id;
						newDatum.save(function(err, resultDatum){
							if(err) {
								throw err;
							}
							console.log(resultDatum._id+' datum created')
							res.writeHead(200, { 'Content-Type': 'application/json' });
							res.write(JSON.stringify(resultDatum));
							res.end();
						});
					}
					if (categoryFound) {
						console.log('Category '+categoryFound._id+' found')
						// Create dataum with account and category
						var newDatum = new Datum();
						newDatum.quantity = req.body.quantity;
						newDatum.category = categoryFound._id;
						newDatum.categoryName = categoryFound.name;
						newDatum.account  = account._id;
						newDatum.save(function(err, resultDatum){
							if(err) {
								throw err;
							}
							console.log(resultDatum._id+' datum created')
							res.writeHead(200, { 'Content-Type': 'application/json' });
							res.write(JSON.stringify(resultDatum));
							res.end();
						});
					}
				});
			}
			if (!account){
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write('{"error":"No account or you are not authorized."}');
				res.end();
			}
		})
	};
};

exports.apiVersion = function(req,res){
	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.write('{ "stable":{"version":"1.0.0"}, "bleeding":{"version":"1.0.0"} }');
	res.end();
}

exports.apiDocs = function(req,res){
	res.render('api-docs',{title: 'API Docs', user: req.user, message: req.flash('info'), error: req.flash('error')})
}

exports.regenKey = function(req,res){
	Account.findById(req.user._id, function(err, account){
		account.key = ( Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) )
		account.save(function(err,resultAccount){
			if(err) {
				throw err;
				req.flash('error', 'Apologies! A new API key was not generated.')
				res.redirect("/api/docs");
			}
			req.flash('info', 'New API key generated. Your old key has been invalidated.')
			res.redirect("/api/docs");
		})
	})
}
