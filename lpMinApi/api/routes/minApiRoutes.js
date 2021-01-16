'use strict';
module.exports = function(app) {
  var minCtrl = require('../controllers/minApiController');

  // todoList Routes
  app.route('/min')
    .post(minCtrl.minify);

  app.route('/com')
    .post(minCtrl.compress);
app.route('/mincom')
    .post(minCtrl.minifycompress);    


  // app.route('/tasks/:taskId')
  //   .get(minCtrl.read_a_task)
  //   .put(minCtrl.update_a_task)
  //   .delete(minCtrl.delete_a_task);
};