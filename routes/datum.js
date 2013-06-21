var passport = require('passport')
    , Account = require('../models/account')
    , Datum = require('../models/datum')
    , Category = require('../models/category');
/*
 * GET home page.
 */
exports.viewDatum = function(io) {
  return function(req,res) {
    Datum.findById(req.params.id, function foundDatum(err, datum) {
      Category.populate(datum, {path: 'category', model: 'Category'}, function(err, datum) {
        Category.find( function foundCategories(err, categories) {
          var catList = [];
          categories.forEach(function(cat) {
            catList.push('"'+cat.name+'"')
          });
          res.render('datum',{title: datum.category.name, user: req.user, datum: datum, categories: catList, message: req.flash('info'), error: req.flash('error')})
        });
      });
    });
  };
};

exports.upDatum = function(io) {
  return function(req,res) {
    var conditions = { _id: req.params.id };
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
				Datum.update(conditions, {quantity: req.body.quantity}, {category: newCategory._id}, {categoryName: newCategory.name}, function upDated(err) {
          if(err) {
            req.flash('error', 'There was a problem in saving that information')
            res.redirect('/datum/'+req.params.id);
            throw err;
          }
        });
      }
      if (categoryFound) {
        Datum.update(conditions, {quantity: req.body.quantity}, {category: categoryFound._id}, {categoryName: categoryFound.name}, function upDated(err) {
          if(err) {
            req.flash('error', 'There was a problem in saving that information')
            res.redirect('/datum/'+req.params.id);
            throw err;
          }
        });
      }
      req.flash('info', 'Updated!')
      res.redirect('/datum/'+req.params.id);
    });
  };
};

exports.removeDatum = function(io) {
  return function(req,res) {
    var conditions = { _id: req.params.id };
    Datum.remove(conditions, function upDated(err) {
      if(err) {
        req.flash('error', 'There was a problem in saving that information')
        res.redirect('/datum/'+req.params.id);
        throw err;
      }
    });
    req.flash('info', 'Removed!')
    res.redirect('/account');
  };
};

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
		if ((!req.body.category) || (!req.body.quantity)){res.redirect('/');}
		if ((req.body.category) && (req.body.quantity)){
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
					newDatum.account  = req.user._id;
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
					newDatum.categoryName = categoryFound.name;
					newDatum.account  = req.user._id;
					newDatum.save(function(err, resultDatum){
						if(err) {
							throw err;
						}
						console.log(resultDatum._id+' datum created')
					});
				}
				req.flash('info', 'Data tracked!')
				res.redirect('/')
			});
		}
  };
};