'use strict';
module.exports = function(app) {
  var nodeCtrl = require('../controllers/purgecss.js');

  // todoList Routes
  app.post('/purge/:params',nodeCtrl.purge);
  app.post('/publish/:params',nodeCtrl.publish);
    


  // app.route('/tasks/:taskId')
  //   .get(minCtrl.read_a_task)
  //   .put(minCtrl.update_a_task)
  //   .delete(minCtrl.delete_a_task);
};