var express = require('express'),
  app = express(),
  port = process.env.PORT || 8090;

var bodyParser = require('body-parser');

app.use(bodyParser.json({limit: '100mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}))



var routes = require('./api/routes/minApiRoutes'); //importing route
routes(app); //register the route
routes = require('./api/routes/purge');
routes(app)

module.exports =app.listen(port);

console.log('todo list RESTful API server started on: ' + port);
//PORT=8000 node server.js