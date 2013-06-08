var passport = require('passport')
    , Account = require('../models/account')
    , Datum = require('../models/datum')
    , Category = require('../models/category');
/*
 * GET home page.
 */

exports.index = function(io) {
	return function(req,res) {
		console.log('User is ' + req.user)

		if (req.user)  {
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
		Account.find( function foundUsers(err, accounts) {
			Category.find( function foundCategories(err, categories) {
	      var catList = [];
	      categories.forEach(function(cat) {
	        catList.push('"'+cat.name+'"')
	      }); 
      		res.render('index',{title: 'Track Anything', user: req.user, accounts: accounts, categories: catList, message: req.flash('info'), error: req.flash('error')})
    	});
    });
  };
};