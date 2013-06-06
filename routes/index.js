//var logic = require('services');
/*
 * GET home page.
 */

exports.index = function(io) {
	return function(req,res) {
		console.log('User is ' + req.user)
		if (req.user)  {
			var userAge = new Date(req.user.birthdate);
			function newAge() {
				var now = new Date();
		    var aged = Math.round((now - userAge)/(1000*60*60*24*7*52)*10000000)/10000000;
			  io.sockets.emit('newAge', { years: aged });
			  ageTimer();
			};
			function ageTimer() {
				setTimeout(newAge, 1000);
			};
			ageTimer();
		}
		res.render('index', { title: 'Track Anything', user: req.user });
  };
};