var passport = require('passport')
    , Account = require('../models/account')
    , Datum = require('../models/datum')
    , Category = require('../models/category');
/*
 * GET home page.
 */

exports.addDatum = function(io) {
  return function(req,res) {
    console.log('User is ' + req.user.email)
    Category.find( function foundCategories(err, categories) {
      var catList = [];
      categories.forEach(function(cat) {
        catList.push('"'+cat.name+'"')
      }); 
      res.render('add-datum',{title: 'Add anything', user: req.user, categories: catList, message: req.flash('info'), error: req.flash('error')})
    });
  };
};

exports.postDatum = function(io) {
  return function(req, res){
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
        newDatum.Account  = req.user._id;
        newDatum.save(function(err, resultDatum){
          if(err) {
            throw err;
          }
          console.log(resultDatum._id+' datum created')
        });
      }
      if (categoryFound) {
        console.log('Category '+categoryFound._id+' found')
        // Create dataum with account and category
        var newDatum = new Datum();
        newDatum.quantity = req.body.quantity;
        newDatum.category = categoryFound._id;
        newDatum.Account  = req.user._id;
        newDatum.save(function(err, resultDatum){
          if(err) {
            throw err;
          }
          console.log(resultDatum._id+' datum created')
        });
      }

      res.redirect('/add-datum')
    });
  };
};