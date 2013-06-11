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
			var whatIsTracking = {}; // Find how much data is behind each category
			whatIsTracking.map = function () { emit(this.category, 1) }
			whatIsTracking.reduce = function (k, vals) { return vals.length }
			whatIsTracking.out = { replace: 'whatIsTracking' }
			whatIsTracking.verbose = true;
			whatIsTracking.query = {account: req.user._id};
			Datum.mapReduce(whatIsTracking, function (err, model, stats) {
			  console.log('whatIsTracking map reduce took %d ms', stats.processtime)
			  model.find().where('value').gt(0).exec(function (err, docs) {
			  	var whenCats = [];
			    async.series([
			    	function(callback){
				    	docs.forEach(function(doc) {
					    	Category.findById(doc._id, function(err, cat) {
					    		console.log(cat.name+' : '+doc.value)
					    		if (!cat){
					    			whenCats.push('')
					    		} 
					    		else {
					    			whenCats.push(cat.name)
					    		}
					    		if (whenCats.length == docs.length){
					    			callback(null)
					    		}
					    	}) // end Category find
					    }) // end forEach
				    },
				    function(callback){
					    Category.find( function foundCategories(err, categories) {
					      var catList = [];
					      categories.forEach(function(cat) {
					        catList.push('"'+cat.name+'"')
					      }); 
				      		res.render('index',{title: 'Track Anything', user: req.user, whenData: docs, whenCats: whenCats, categories: catList, message: req.flash('info'), error: req.flash('error')})
				    	}) // end Category list compilation
					  }
			    ])
			  });
			});
		}
		if (!req.user){
			var whatIsTracking = {}; // Find how much data is behind each category
			whatIsTracking.map = function () { emit(this.category, 1) }
			whatIsTracking.reduce = function (k, vals) { return vals.length }
			whatIsTracking.out = { replace: 'whatIsTracking' }
			whatIsTracking.verbose = true;
			Datum.mapReduce(whatIsTracking, function (err, model, stats) {
			  console.log('whatIsTracking map reduce took %d ms', stats.processtime)
			  model.find().where('value').gt(0).exec(function (err, docs) {
			    docs.forEach(function(doc) {
			    	Category.findById(doc._id, function(err, cat) {
			    		console.log(cat.name+' : '+doc.value)
			    	})
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
					   		res.render('index',{title: 'Track Anything', user: req.user, whenData: whenDocs, accounts: accounts, message: req.flash('info'), error: req.flash('error')})
					    });
					  });
					})
			  });
			})
		}
  };
};

// For testing on the home page without logging in
exports.test = function(io) {
	return function(req,res) {
		Account.findById('51ac0652ebc3e556db000001', function(err, testUser){
			Datum.find({account:'51ac0652ebc3e556db000001', distinct: 'category'}, function(err,foundData){
				Category.populate(foundData, { path: 'category' }, function(err, data) {
					res.render('test-index',{title: 'Track Anything', user: testUser, data: data, message: req.flash('info'), error: req.flash('error')})
				})
			})
			
			var whatIsTracking = {}; // Find how much data is behind each category
			whatIsTracking.map = function () { emit(this.category, 1) }
			whatIsTracking.reduce = function (k, vals) { return vals.length }
			whatIsTracking.out = { replace: 'whatIsTracking' }
			whatIsTracking.verbose = true;
			whatIsTracking.query = {account: '51ac0652ebc3e556db000001'};
			Datum.mapReduce(whatIsTracking, function (err, model, stats) {
			  console.log('whatIsTracking map reduce took %d ms', stats.processtime)
			  model.find().where('value').gt(0).exec(function (err, docs) {
			  	var whenCats = [];
			    async.series([
			    	docs.forEach(function(doc) {
				    	Category.findById(doc._id, function(err, cat) {
				    		console.log(cat.name+' : '+doc.value)
				    		whenCats.push(cat.name)
				    	})
				    }),
				    Category.find( function foundCategories(err, categories) {
				      var catList = [];
				      categories.forEach(function(cat) {
				        catList.push('"'+cat.name+'"')
				      }); 
			      		res.render('index',{title: 'Track Anything', user: testUser, whenData: docs, whenCats: whenCats, categories: catList, message: req.flash('info'), error: req.flash('error')})
			    	})
			    ])
			  })
			})
		});
	}
}
