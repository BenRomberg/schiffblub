/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var socket = require('socket.io');

var Field = require('./Field');
var Game = require('./Game');

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

var listGames = function (receiver) {
  var gameList = [];
  Object.keys(games).forEach(function(name) {
    var opponent = games[name].getOpponent();
    gameList.push({
      name: name,
      creatorName: games[name].getCreator().getName(),
      opponentName: opponent ? opponent.getName() : null
    });
  });
  receiver.emit('list games', gameList);
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
    listGames(socket);
  });

  function broadcastGameJoined(game, isCreator) {
    listGames(socket.broadcast);
    socket.emit('joined game', getGameData(game, isCreator));
  }

  socket.on('create game', function (data) {
    if (games[data.name])
      return handleError('Game with name <' + data.name + '> already exists.');
    withPlayer(function (player) {
      games[data.name] = new Game(data.name, player.name);
      console.log('created and joined game ' + data.name);
      broadcastGameJoined(games[data.name], true);
    });
  });

  function withPlayer(func) {
    socket.get('player', function (err, player) {
      if (err)
        return handleError('You\'re not logged in.');
      func(player);
    });
  }

  function getGameData(game, isCreator) {
    return {
      name: game.getName(),
      own: {
        name: getOwn().getName(),
        field: getOwn().getField().get()
      },
      opponent: {
        name: getOpponent() ? getOpponent().getName() : null,
        field: new Field().get()
      }
    };

    function getOwn() {
      return isCreator ? game.getCreator() : game.getOpponent();
    }

    function getOpponent() {
      return !isCreator ? game.getCreator() : game.getOpponent();
    }
  }

  socket.on('join game', function (data) {
    if (!games[data.name])
      return handleError('Game with name <' + data.name + '> not found.');
    withPlayer(function (player) {
      if (player.name === games[data.name].getCreator().getName())
        return handleError('Cannot join your own game.');
      games[data.name].setOpponentName(player.name);
      console.log('joined game ' + data.name);
      broadcastGameJoined(games[data.name], false);
    });
  });

  socket.on('disconnect', function () {
    // todo
  });
});
