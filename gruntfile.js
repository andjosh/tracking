module.exports = function(grunt) {

  var Account = require('./models/account')
    , Datum = require('./models/datum')
    , Category = require('./models/category')
    , Mailgun = require('mailgun').Mailgun
    , mongoose = require('mongoose');
  // Define what/which mongo to yell at
  var mongoUri = process.env.MONGOLAB_URI
                || process.env.MONGOHQ_URL
                || 'mongodb://localhost/trackme';

  var mg = new Mailgun('key-5n1bqp873lh8yritf-uiogsvgn120fa4');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });

  grunt.registerTask('statusUpdate', 'email out a status update on accounts', function() {
    // Invoke async mode
    var done = this.async();
    // Connect mongoose
    mongoose.connect(mongoUri);
    Account.count( function foundUsers(err, accounts) {
      mg.sendText('info@ontrack.io', ['jsh@bckmn.com'],
        'OnTrack Update',
        'There are currently '+accounts.toString()+' active accounts OnTrack.'+
        '- Grunted OnTrack.io',
        'trackme.mailgun.org', {},
        function(err) {
          if (err) {console.log('Oh noes: ' + err); done();}
          else     {console.log('Successful statusUpdate email'); done();}
        }
      );
    });
  });

  grunt.registerTask('consolidateDupeDates', 'remedy users entering multiple quantities under the same category for the same date', function() {
    // Invoke async mode
    var done = this.async();
    // Connect mongoose
    mongoose.connect(mongoUri);
    // Actually need to determine if this is necessay. 
    // Maybe there are cases where users want to track 
    // multiple occurrences fo a category for each day.
  });

};