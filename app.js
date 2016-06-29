'use strict';

/**
 * App main file
 *
 * @module      :: app
 * @description :: Load, modules, conrollers, routes, libs and start app
 */

/**
 * Module variables
 */

let fs, express, mongoose, passport, config, app, port, connect, path;

/**
 * Module dependencies
 */

fs = require('fs');
path = require('path');
express = require('express');
mongoose = require('mongoose');
passport = require('passport');
config = require('./config');

app = express();
port = process.env.PORT || 3000;

// Connect to mongodb
connect = function() {
  mongoose.connect(
  'mongodb://localhost/jsbook', {
    server: {
      socketOptions: {
        keepAlive: 1,
      },
    },
  });
};

// Open db connection
// ----------------------------------------------

connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

// Bootstrap models
// ----------------------------------------------

fs.readdirSync(path.join(__dirname, '/app/models')).forEach(function(file) {
  if (~file.indexOf('.js')) { require(path.join(__dirname, '/app/models/', file)); }
});

// Bootstrap passport config
// ----------------------------------------------

require('./config/passport')(passport);

// Bootstrap application settings
// ----------------------------------------------

require('./config/express')(app, passport);

// Bootstrap routes
// ----------------------------------------------

require('./config/routes')(app, passport);

// Routes ext
// ----------------------------------------------

app.use(function(err, req, res, next) {
  // Treat as 404
  if (err.message && (~err.message.indexOf('not found') || (~err.message.indexOf('Cast to ObjectId failed')))) { return next(); }

  // Error page
  res.status(500).render('500', {
    error: err.stack,
  });
});

// Assume 404 since no middleware responded
app.use(function(req, res) {
  res.status(404).render('404', {
    url: req.originalUrl,
    error: 'Not found',
  });
});

// Start app
// ----------------------------------------------

app.listen(port);
console.log('Express app started on port ' + port);
