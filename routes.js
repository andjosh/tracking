var passport = require('passport')
    , index = require('./routes/index')
    , Account = require('./models/account')
    , Datum = require('./models/datum')
    , Category = require('./models/category');

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

module.exports = function (app) {

    app.get('/register', function(req, res) {
        res.render('register', { title: 'Register', user: req.user });
    });

    app.post('/register', function(req, res) {
        Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
            if (err) {
                return res.render('register', { account : account });
            }
            res.redirect('/account');
        });
    });

    app.get('/account', ensureAuthenticated, function(req, res){
      res.render('account', { user: req.user, title : "Your account" });
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
          throw err;
        }
      });
      res.redirect('/');
    });

    app.get('/login', function(req, res) {
        res.render('login', { title: 'Log In', user: req.user });
    });

    app.post('/login', passport.authenticate('local'), function(req, res) {
        if (res.body == 'Unauthorized') {
          console.log("Login error")
        }
        console.log("Login error")
        res.redirect('/account');
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};