var passport = require('passport')
    , Account = require('../models/account')
    , Datum = require('../models/datum')
    , Category = require('../models/category')
    , async = require('async');
/*
 * GET home page.
 */
function range1(i){return i?range1(i-1).concat(i):[]}
function shuffle(array) {
	var counter = array.length, temp, index;
    while (counter > 0) {
        index = (Math.random() * counter--) | 0;
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

exports.index = function(io) {
	return function(req,res) {

		if (req.user)  {
			if (req.user.birthdate){
				ageTimer();
				var userAge = new Date(req.user.birthdate), i = 0;
				function newAge() {
					var now = new Date();
					var aged = Math.round((now - userAge)/(1000*60*60*24*365.25)*10000000)/10000000;
					io.sockets.emit('newAge'+req.user._id, { years: aged });
					i++;
					if(i<60){ageTimer();}
				};
				function ageTimer() {
					setTimeout(newAge, 1000);
				};
			}

			Datum.find({account: req.user._id}, 'category').distinct('category', function(err,foundCats){
				if (err){console.log('Error: '+err)}
				var finalCats = [];
				async.series([
					function(callback){
							foundCats.forEach(function(cat){
								Category.findById(cat, '_id name', function(err, endCat){
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
							res.render('index',{title: 'OnTrack.io', user: req.user, foundCats: finalCats, categories: catList, message: req.flash('info'), error: req.flash('error')})
						})
					}
				]);
				if (foundCats == ''){
					req.flash('info', 'Great! Now you can enter your data and get on track.')
					Category.find( function foundCategories(err, categories) {
							var catList = [];
							categories.forEach(function(cat) {
								catList.push('"'+cat.name+'"')
							});
							res.render('index',{title: 'OnTrack.io', user: req.user, foundCats: [], categories: catList, message: req.flash('info'), error: req.flash('error')})
					})
				};
			});
		}
		if (!req.user){
			var range = range1(15); var graphable = shuffle(range);
			res.render('index',{title: 'OnTrack.io', graphable: graphable, message: req.flash('info'), error: req.flash('error')})
		}
  };
};

// For testing
exports.stats = function(io) {
	return function(req,res) {
		var jsonString = '{"whatIsTracking":{"time":';
		var whatIsTracking = {}; // Find how much data is behind each category
		whatIsTracking.map = function () { emit(this.categoryName, 1) }
		whatIsTracking.reduce = function (k, vals) { return vals.length }
		whatIsTracking.out = { replace: 'whatIsTracking' }
		whatIsTracking.verbose = true;
		Datum.mapReduce(whatIsTracking, function (err, model, stats) {
			if (!model){res.redirect('/add-datum');}
			if (model){
				jsonString += '"'+stats.processtime.toString()+'",';
				console.log(jsonString)
				model.find().where('value').gt(0).exec(function (err, docs) {
					docs.forEach(function(doc) {
						if(doc._id){
							jsonString += '"'+doc._id.toString()+'" : "'+doc.value.toString()+'",';
						}
					})
					jsonString += '"count":"'+docs.length+'"';
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
					// whenTracking.limit = 30;
					whenTracking.verbose = true;
					Datum.mapReduce(whenTracking, function (err, model, stats) {
						jsonString += '},"whenTracking":{"time":"'+stats.processtime.toString()+'",';
						model.find().sort('_id').exec(function (err, whenDocs) {
							whenDocs.forEach(function(doc) {
								jsonString += '"Data entered '+doc._id.toString()+'" : "'+doc.value.toString()+'",';
							})
							jsonString += '"count":"'+whenDocs.length+'"';
							Account.count( function foundUsers(err, accounts) {
								jsonString += '},"accounts":"'+accounts.toString()+'"}';
								res.writeHead(200, { 'Content-Type': 'application/json' });
								res.write(jsonString);
								res.end();
							});
						});
					})
				});
			}
		})
	}
}
