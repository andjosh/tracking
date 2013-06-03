var mongoose = require('mongoose')
  , User = require('../models/user.js');


module.exports = userModel;


function userModel(connection) {
  mongoose.connect(connection);
  var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'DB connection error:'));
	db.once('open', function callback() {
	  console.log('Connected to DB');
	});
}


userModel.prototype = {
  showTasks: function(req, res) {
    User.find({itemCompleted: false}, function foundTasks(err, items) {
      res.render('todo',{title: 'My ToDo List ', tasks: items})
    });
  },


  addTask: function(req,res) {
    var item = req.body.item;
    newTask = new User();
    newTask.itemName = item.name;
    newTask.itemCategory = item.category;
    newTask.save(function savedTask(err){
      if(err) {
        throw err;
      }
    });
    res.redirect('/');
  },


  completeTask: function(req,res) {
    var completedTasks = req.body;
    for(taskId in completedTasks) {
      if(completedTasks[taskId]=='true') {
        var conditions = { _id: taskId };
        var updates = { itemCompleted: completedTasks[taskId] };
        task.update(conditions, updates, function updatedTask(err) {
          if(err) {
            throw err;
          }
        });
      }
    }
    res.redirect('/');
  }
}