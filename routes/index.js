var passport = require('passport')
    , Account = require('../models/account')
    , Datum = require('../models/datum')
    , Category = require('../models/category')
    , async = require('async');
/*
 * GET home page.
 */

exports.index = function(io) {
	return function(req,res) {

		if (req.user)  {
			console.log('User is ' + req.user.email)
			if (req.user.birthdate){
				ageTimer();
				var userAge = new Date(req.user.birthdate);
				function newAge() {
					var now = new Date();
					var aged = Math.round((now - userAge)/(1000*60*60*24*7*52)*10000000)/10000000;
					io.sockets.emit('newAge'+req.user._id, { years: aged });
					ageTimer();
				};
				function ageTimer() {
					setTimeout(newAge, 1000);
				};
			}

			Datum.find({account: req.user._id}, 'category').distinct('category', function(err,foundCats){
				if (err){console.log(err)}
				var finalCats = [];
				async.series([
					function(callback){
						foundCats.forEach(function(cat){
							Category.findById(cat, function(err, endCat){
								if (!endCat){
									finalCats.push('')
								}
								else {
									finalCats.push(endCat);
								}
								if (finalCats.length == foundCats.length){callback(null)}
							})
						})
					},
					function(callback){
						Category.find( function foundCategories(err, categories) {
							var catList = [];
							categories.forEach(function(cat) {
								catList.push('"'+cat.name+'"')
							});
							res.render('index',{title: 'On Track', user: req.user, foundCats: finalCats, categories: catList, message: req.flash('info'), error: req.flash('error')})
						})
					}
				])
			});
		}
		if (!req.user){
			var whatIsTracking = {}; // Find how much data is behind each category
			whatIsTracking.map = function () { emit(this.categoryName, 1) }
			whatIsTracking.reduce = function (k, vals) { return vals.length }
			whatIsTracking.out = { replace: 'whatIsTracking' }
			whatIsTracking.verbose = true;
			Datum.mapReduce(whatIsTracking, function (err, model, stats) {
			  console.log('whatIsTracking map reduce took %d ms', stats.processtime)
			  model.find().where('value').gt(0).exec(function (err, docs) {
			    docs.forEach(function(doc) {
			    	console.log(doc._id+' : '+doc.value)
			    })
			    var whenTracking = {}; // Find when data is being tracked/entered
					whenTracking.map = function () { emit(
						(
							(this.date.getFullYear()).toString()
							+ ( ((this.date.getMonth() + 1).toString() > 9) ? (this.date.getMonth() + 1).toString() : '0'+(this.date.getMonth() + 1).toString() )
							+ ( ((this.date.getDate() + 1).toString() > 9) ? (this.date.getDate() + 1).toString() : '0'+(this.date.getDate() + 1).toString() )
							)
							, 1) }
					whenTracking.reduce = function (k, vals) { return vals.length }
					whenTracking.out = { replace: 'whenTracking' }
					whenTracking.limit = 30;
					whenTracking.verbose = true;
					Datum.mapReduce(whenTracking, function (err, model, stats) {
					  console.log('whenTracking map reduce took %d ms', stats.processtime)
					  model.find().sort('_id').exec(function (err, whenDocs) {
					    whenDocs.forEach(function(doc) {
					    	console.log('Data entered '+doc._id+' : '+doc.value)
					    })
					    Account.count( function foundUsers(err, accounts) {
					   		res.render('index',{title: 'On Track', whenData: whenDocs, accounts: accounts, message: req.flash('info'), error: req.flash('error')})
					    });
					  });
					})
			  });
			})
		}
  };
};

// For testing
exports.test = function(io) {
	return function(req,res) {
		Datum.find( function(err,allData){
			allData.forEach(function(d){
				Category.findById(d.category, function(err,cat){
					d.categoryName = cat.name;
					d.save(function(err,saved){
						if(err) {
            	throw err;
						}
						console.log(saved._id+' datum updated')
					})
				})
			})
		})
		Account.find( function(err, allAcct){
			allAcct.forEach(function(a){
				a.key = ( Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) );
				a.save(function(err,saved){
					if(err) {
						throw err;
					}
					console.log(saved._id+' account key created')
				})
			})
		})
		res.redirect('/');
	}
}
