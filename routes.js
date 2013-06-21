var passport = require('passport')
    , index = require('./routes/index')
    , Account = require('./models/account')
    , Datum = require('./models/datum')
    , Category = require('./models/category')
    , Mailgun = require('mailgun').Mailgun;

var mg = new Mailgun('key-5n1bqp873lh8yritf-uiogsvgn120fa4');
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
function ensureAdmin(req, res, next){
	if (req.user && (req.user.admin == true)){ return next(); }
	res.redirect('/')
}

module.exports = function (app) {

		app.get('/my-data', ensureAuthenticated, function(req, res){
			Datum.find({account: req.user._id},'id quantity date categoryName', function(err, theData){
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify(theData));
				res.end();
			})
		})

    app.get('/register', function(req, res) {
        res.render('register', { title: 'Register', user: req.user, message: req.flash('info'), error: req.flash('error') });
    });

		app.get('/about', function(req, res) {
        res.render('about', { title: 'About', user: req.user, message: req.flash('info'), error: req.flash('error') });
    });

    app.post('/register', function(req, res) {
      if (req.body.password != req.body.password_conf) {
        req.flash('error', 'Password and password confirmation must match.')
        res.redirect('/register');
      }
      Account.register(new Account({ email : req.body.email }), req.body.password, function(err, account) {
          if (err) {
              req.flash('error', 'That email is already in use.')
              return res.redirect('/register');
          }
          // Welcome email
          mg.sendText('info@ontrack.io', [req.body.email, 'jsh@bckmn.com'],
            'Get On track!',
            'Congratulations on wating to get on track! You can always track yourself, every day, on the home page: http://ontrack.io Thanks! - Josh, OnTrack.io',
            'trackme.mailgun.org', {},
            function(err) {
              if (err) console.log('Oh noes: ' + err);
              else     console.log('Successful Welcome email');
          });
          // Then redirect
          req.flash('info', 'Great! Now log in using the account you just created.')
          res.redirect('/account');
      });
    });

    app.get('/account', ensureAuthenticated, function(req, res){
      Datum.find({account: req.user._id}).sort('-date').exec(function(err,data) { // Find account data
        Category.populate(data, {path: 'category', model: 'Category'}, function(err, data) {
          res.render('account', { user: req.user, title : "Your account", data: data, message: req.flash('info') });
        })
      })
    });

    app.post('/account', ensureAuthenticated, function(req, res){
      var conditions = { _id: req.user._id }, month, day, year;
      if (req.body.birthdate) {
        month = req.body.birthdate[0]+req.body.birthdate[1];
        day = req.body.birthdate[3]+req.body.birthdate[4];
        year = req.body.birthdate[6]+req.body.birthdate[7]+req.body.birthdate[8]+req.body.birthdate[9];
      }
      var updates = { username : req.body.username,
                      email : req.body.email,
                      gender : req.body.gender,
                      birthdate : new Date(year, month-1, day),
                      occupation : req.body.occupation,
                      location : req.body.location}
      Account.update(conditions, updates, function updatedAccount(err) {
        if(err) {
          req.flash('error', 'There was a problem in saving that information')
          res.redirect('/account');
          throw err;
        }
      });
      req.flash('info', 'Updated!')
      res.redirect('/');
    });

    app.get('/login', function(req, res) {
      res.render('login', { title: 'Log In', user: req.user, message: req.flash('info'), error: req.flash('error') });
    });

    app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: 'Invalid email or password.' }), function(req, res) {

        if (req.user.birthdate){
					req.flash('info', 'Hi there!')
					res.redirect('/');
				}
				if (!req.user.birthdate){
					req.flash('info', 'Hi there! You should probably fill in some information about yourself.')
					res.redirect('/account');
				}
    });

    app.get('/reset-password', ensureAuthenticated, function(req, res) {
      res.render('reset-password', { title: 'Change Password', user: req.user, message: req.flash('info'), error: req.flash('error') });
    });

    app.post('/reset-password', ensureAuthenticated, function(req, res) {
      if (req.body.password != req.body.password_conf) {
        req.flash('error', 'New password and password confirmation must match.')
        res.redirect('/reset-password');
      }
      Account.findById(req.user._id, function foundAccount(err, account){
        account.setPassword(req.body.password, function setPassword(err, resetAccount){
          if(err) {
            req.flash('error', 'There was a problem in saving that information')
            res.redirect('/account');
            throw err;
          }
          resetAccount.save(function(err, saved){
            if(err) {
              req.flash('error', 'There was a problem in saving that information')
              res.redirect('/account');
              throw err;
            }
            req.flash('info', 'New password saved!')
            res.redirect('/account');
          })
        })
      })
    });

    app.get('/logout', function(req, res) {
        req.logout();
        req.flash('info', 'You have been logged out. Thanks for staying on track!')
        res.redirect('/');
    });

		app.get('/contact', function(req, res) {
      res.render('contact', { title: 'Contact', user: req.user, message: req.flash('info'), error: req.flash('error') });
    });

		app.post('/contact', function(req, res) {
			mg.sendText(req.body.sender, ['jsh@bckmn.com'],
									'Contact from OnTrack.io',
									req.body.words,
									'trackme.mailgun.org', {},
									function(err) {
										if (err) console.log('Oh noes: ' + err);
										else     console.log('Successful Contact email');
									});
			req.flash('info', 'Your message has been sealed with a kiss and sent!')
      res.redirect('/');
    });

    app.get('/category/:id', ensureAuthenticated, function(req, res) {
			Category.findById(req.params.id, function(err,category){
				Datum.find({account: req.user._id, category: req.params.id},null, {sort: 'date'}, function(err, data){
					Datum.find({category: req.params.id}, null, {sort:'date'}, function(err, bigData){
						Account.populate(bigData,{ path: 'account' }, function(err, bigData){
							var theirData = [];
							bigData.forEach(function(da){
								if (da.account){
									if(da.account.gender == req.user.gender){
										var bday = new Date(da.account.birthdate), myday = new Date(req.user.birthdate);
										if( ((bday-myday) < 15724800000) || ((myday-bday) < 15724800000) ){
											theirData.push(da.quantity)
										}
									}
								}
							})
							res.render('category', { title: category.name, user: req.user, theData: data, theirData: theirData, category: category, message: req.flash('info'), error: req.flash('error') });
						})
					})
				})
			})
    });

		app.get('/off-track', ensureAdmin, function(req,res){
			Account.find( function(err,accounts){
				Category.find(function(err,categories){
					res.render('offTrack', { title: 'OffTrack', user: req.user, accounts: accounts, categories: categories, message: req.flash('info'), error: req.flash('error') });
				})
			})
		})
		app.get('/off-track/accounts', ensureAdmin, function(req,res){
			Account.find( function(err,accounts){
				res.render('offTrackAccounts', { title: 'OffTrack Accounts', user: req.user, accounts: accounts, message: req.flash('info'), error: req.flash('error') });

			})
		})
		app.get('/off-track/categories', ensureAdmin, function(req,res){
			Category.find(function(err,categories){
				res.render('offTrackCategories', { title: 'OffTrack Categories', user: req.user, categories: categories, message: req.flash('info'), error: req.flash('error') });
			})
		})
		app.get('/off-track/accounts/:id', ensureAdmin, function(req,res){
			Account.findById(req.params.id, function(err,account){
				Datum.find({account: req.params.id}, function(err,data){
					res.render('offTrackAccount', { title: 'OffTrack', user: req.user, data: data, account: account, message: req.flash('info'), error: req.flash('error') });
				})
			})
		})
		app.get('/off-track/categories/:id', ensureAdmin, function(req,res){
			Category.findById(req.params.id, function(err,category){
				Datum.find({category:req.params.id}, function(err,data){
					res.render('offTrackCategory', { title: 'OffTrack', user: req.user, data: data, category: category, message: req.flash('info'), error: req.flash('error') });
				})
			})
		})
		app.post('/off-track/accounts/:id', ensureAdmin, function(req,res){
			if (req.body.password){var conditions = { admin: req.body.admin, fullAccess: req.body.fullAccess };}
			if (!req.body.password){var conditions = { admin: req.body.admin, fullAccess: req.body.fullAccess };}
			Account.update({ _id: req.params.id}, conditions, function upDated(err) {
				if(err) {
					req.flash('error', 'There was a problem in saving that information');
					res.redirect('/off-track/accounts/'+req.params.id);
					throw err;
				}
				req.flash('info', 'Updated!')
				res.redirect('/off-track/accounts/'+req.params.id);
			});
		})
		app.post('/off-track/categories/:id', ensureAdmin, function(req,res){
			Category.findById(req.body.migrateId, function(err,category){
				Datum.find({category: req.params.id}, function(err, data){
					data.forEach(function(datum){
						datum.category = req.body.migrateId;
						datum.categoryName = category.name;
						datum.save(function(err,saved){
							if (err){
								req.flash('error', 'There was a problem in saving that information')
								res.redirect('/off-track/categories/'+req.params.id);
								throw err;
							}
							req.flash('info', 'Updated!')
							res.redirect('/off-track/categories/'+req.params.id);
						})
					})
				})
			})
		})
		app.get('/off-track/accounts/delete/:id', ensureAdmin, function(req,res){
			var conditions = { _id: req.params.id };
			Account.remove(conditions, function upDated(err) {
				if(err) {
					req.flash('error', 'There was a problem in deleting that account')
					res.redirect('/off-track/accounts/'+req.params.id);
				}
				Datum.remove({account: req.params.id}, function deleted(err) {
					if(err) {
						req.flash('error', 'There was a problem in deleting that account data')
						res.redirect('/off-track/accounts/'+req.params.id);
					}
					req.flash('info', 'Removed!')
					res.redirect('/off-track');
				})
			});
		})
		app.get('/off-track/categories/delete/:id', ensureAdmin, function(req,res){
			var conditions = { _id: req.params.id };
			Category.remove(conditions, function upDated(err) {
				if(err) {
					req.flash('error', 'There was a problem in deleting that information')
					res.redirect('/off-track/categories/'+req.params.id);
				}
				req.flash('info', 'Removed!')
				res.redirect('/off-track');
			});
		})
};