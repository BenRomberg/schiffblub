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

var Player = mongoose.model('Player', {
  name: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  gamesWon: { type: Number, default: 0 },
  gamesLost: { type: Number, default: 0 }
});

var io = socket.listen(server);
io.set('log level', 1);
var games = {};

var Game = function (name, creator) {
  this.name = name;
  this.creator = creator;
}

var listGames = function (receiver) {
  receiver.emit('list games', games);
};

io.sockets.on('connection', function (socket) {
  function handleError(message) {
    console.log('ERROR', message);
    socket.emit('error', message);
  }

  function login(player) {
    socket.set('player', player);
    console.log('LOGGED IN', player);
    socket.emit('logged in');
  }

  socket.on('register', function (data) {
    var newPlayer = new Player({ name: data.name, password: data.password });
    newPlayer.save(function (err) {
      if (err)
        return handleError('Error creating new player: ' + err);
      console.log('SAVED', newPlayer);
      login(newPlayer);
    });
  });

  socket.on('login', function (data) {
    Player.findOne({ 'name': data.name }, function (err, player) {
      if (err)
        return handleError(err);
      if (!player)
        return handleError('Player with name <' + data.name + '> not found.');
      if (data.password !== player.password)
        return handleError('Wrong password.' + data.password + player.password);
      login(player);
    });
  });

  socket.on('list games', function (data) {
    socket.emit('list games', games);
  });

  function broadcastGameJoined() {
    listGames(socket.broadcast);
    socket.emit('joined game');
  }

  socket.on('create game', function (data) {
    if (games[data.name])
      return handleError('Game with name <' + data.name + '> already exists.');
    withPlayer(function (player) {
      games[data.name] = new Game(data.name, player);
      console.log('created and joined game ' + data.name);
      broadcastGameJoined();
    });
  });

  function withPlayer(func) {
    socket.get('player', function (err, player) {
      if (err)
        return handleError('You\'re not logged in.');
      func(player);
    });
  }

  socket.on('join game', function (data) {
    if (!games[data.name])
      return handleError('Game with name <' + data.name + '> not found.');
    withPlayer(function (player) {
      games[data.name].opponent = player;
      console.log('joined game ' + data.name);
      broadcastGameJoined();
    });
  });

  socket.on('disconnect', function () {
    // todo
  });
});
