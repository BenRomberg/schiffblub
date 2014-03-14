/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var socket = require('socket.io');
var mongoose = require('mongoose');

var Field = require('./Field');
var Game = require('./Game');
var Player = require('./Player');

var Environment = require('./Environment')
var LoginController = require('./LoginController')
var LobbyController = require('./LobbyController')
var GameController = require('./GameController')

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

var server = http.createServer(app);
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

mongoose.connect('mongodb://localhost/schiffblub');

var io = socket.listen(server);
io.set('log level', 1);

io.sockets.on('connection', function (socket) {
  var environment = new Environment(socket);
  new LoginController(socket, environment);
  new LobbyController(socket, environment);
  new GameController(socket, environment);
});
