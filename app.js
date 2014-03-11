/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var socket = require('socket.io');

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
//app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/schiffblub');

var Player = mongoose.model('Player', { name: String });

var io = socket.listen(server);
var maxRoomId = 0;

var listRooms = function(receiver) {
  receiver.emit('list rooms', io.sockets.manager.rooms);
};

io.sockets.on('connection', function (socket) {
  listRooms(socket);

  socket.on('login', function (name, password) {
    socket.set('user id', name, function () {
      socket.emit('ready');
    });
  });

  socket.on('create room', function (data) {
    socket.join(++maxRoomId);
    listRooms(socket);
    listRooms(socket.broadcast);
    console.log('created room ' + maxRoomId);
  });
  socket.on('disconnect', function() {
    // todo
  });
});
