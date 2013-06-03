//var logic = require('services');
/*
 * GET home page.
 */

exports.index = function(io) {
	return function(req,res) {
		res.render('index', { title: 'Track Anything', user: req.user });
  };
};