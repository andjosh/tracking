/**
  * TrackAnything: Everyone loves a graph.
  *
  * @author Joshua Beckman <@jbckmn> || <jsh@bckmn.com>
  * @license The MIT license. 2013
  *
  */
if(process.env.NODETIME_ACCOUNT_KEY) {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'OnTrack'
  });
}
var express = require('express')
    , routes = require('./routes')
    , load = require('express-load')
    , mongoose = require('mongoose')
    , passport = require('passport')
    , flash = require('connect-flash')
  	, LocalStrategy = require('passport-local').Strategy
    , index = require('./routes/index')
    , datum = require('./routes/datum')
		, api = require('./routes/api')
    , http = require('http')
    , path = require('path')
    , io = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// For Heroku sockets to work
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

// Socket code
io.sockets.on('connection', function (socket) {
    socket.emit('admin', { message: 'Welcome!' });
});

// Define what mongo to yell at
var mongoUri = process.env.MONGOLAB_URI
                || process.env.MONGOHQ_URL
                || 'mongodb://localhost/trackme';

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
    app.set('port', process.env.PORT || 5000);
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(flash());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session({ secret: 'marybeth and the fox fighting bant' })); // CHANGE THIS SECRET!
	  // Remember Me middleware
	  app.use( function (req, res, next) {
	    if ( req.method == 'POST' && req.url == '/login' ) {
	      if ( req.body.rememberme ) {
	        req.session.cookie.maxAge = 2592000000; // 30*24*60*60*1000 Rememeber 'me' for 30 days
	      } else {
	        req.session.cookie.expires = false;
	      }
	    }
	    next();
	  });

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler({ showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

server.listen(app.get('port'));

// Let's see what's going on
console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);

// Configure passport
var Account = require('./models/account');

passport.use(new LocalStrategy(Account.authenticate()));

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// Connect mongoose
mongoose.connect(mongoUri);

// Route protection
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

// Setup routes
require('./routes')(app);

// Setup API
app.get("/api/docs", ensureAuthenticated, api.apiDocs);
app.get("/api/version", api.apiVersion);
app.get("/api/1/account/:key", api.viewAccount);
app.get("/api/1/category/:category", api.viewCategory);
app.get("/api/1/categories", api.allCategories);
app.post("/api/1/add/:key", api.makeDatum(io));
app.delete("/api/1/datum/:id/:key", api.deleteDatum);
app.get("/api/regenerate", ensureAuthenticated, api.regenKey);

// Routes with io
app.get("/", index.index(io));
app.get("/i-am-a-jedi", index.test(io));
app.get("/add-datum", ensureAuthenticated, datum.addDatum(io));
app.post("/add-datum", ensureAuthenticated, datum.postDatum(io));
app.get("/datum/:id", ensureAuthenticated, datum.viewDatum(io));
app.post("/datum/:id", ensureAuthenticated, datum.upDatum(io));
app.get("/datum/:id/remove", ensureAuthenticated, datum.removeDatum(io));
