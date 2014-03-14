/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var socket = require('socket.io');
var mongoose = require('mongoose');

var Field = require('./Field');
var Game = require('./Game');
var Player = require('./Player');

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

mongoose.connect('mongodb://localhost/schiffblub');

var io = socket.listen(server);
io.set('log level', 1);
var games = {};

var listGames = function (receiver) {
  var gameList = [];
  Object.keys(games).forEach(function (name) {
    var opponent = games[name].getVisitor();
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
        return handleError('Wrong password.');
      login(player);
    });
  });

  socket.on('list games', function (data) {
    listGames(socket);
  });

  function sendGameJoined(game, playerField) {
    socket.emit('joined game', getGameData(game, playerField));
  }

  function broadcastGameJoined(game, playerField) {
    listGames(socket.broadcast);
    socket.join(game.getName());
    sendGameJoined(game, playerField);
  }

  socket.on('create game', function (gameName) {
    if (games[gameName])
      return handleError('Game with name <' + gameName + '> already exists.');
    withPlayer(function (player) {
      games[gameName] = new Game(gameName, player.name);
      console.log('created and joined game ' + gameName);
      broadcastGameJoined(games[gameName], games[gameName].getCreator());
    });
  });

  function getGame(gameName) {
    if (!games[gameName]) {
      handleError('Game with name <' + gameName + '> not found.');
      return null;
    }
    return games[gameName];
  }

  function withPlayerAndGame(gameName, func) {
    withPlayer(function (player) {
      var game = getGame(gameName);
      if (!game) return;
      var playerField = game.getPlayerField(player.name);
      if (!playerField)
        return handleError('You are not part of this game.');
      func(playerField, game);
    });
  }

  function withPlayer(func) {
    socket.get('player', function (err, player) {
      if (err || !player)
        return handleError('You\'re not logged in.');
      func(player);
    });
  }

  function getGameData(game, playerField) {
    var opponent = game.getOpponent(playerField);
    return {
      active: game.isActive(playerField),
      gameOver: game.isGameOver(),
      name: game.getName(),
      own: {
        name: playerField.getName(),
        field: playerField.getField().get(),
        ready: playerField.isReady()
      },
      opponent: {
        name: opponent ? opponent.getName() : null,
        field: opponent ? opponent.getField().filterShot() : null,
        ready: opponent ? opponent.isReady() : false
      }
    };
  }

  function refreshGame(receiver, game, playerField) {
    receiver.emit('refresh game', getGameData(game, playerField));
  }

  function broadcastGameRoom(game, playerField) {
    if (playerField !== null)
      refreshGame(socket.broadcast.to(game.getName()), game, playerField);
  }

  socket.on('join game', function (gameName) {
    withPlayer(function (player) {
      var game = getGame(gameName);
      if (!game) return;
      var existingPlayerField = game.getPlayerField(player.name);
      if (existingPlayerField !== null) {
        sendGameJoined(game, existingPlayerField);
        return;
      }
      if (game.getVisitor() !== null)
        return handleError('Game is full.');
      game.setVisitorName(player.name);
      console.log('joined game ' + gameName);
      broadcastGameJoined(game, game.getVisitor());
      broadcastGameRoom(game, game.getCreator());
    });
  });

  socket.on('repopulate', function (gameName) {
    withPlayerAndGame(gameName, function (playerField, game) {
      if (playerField.isReady())
        return handleError('Cannot repopulate after you\'re ready.');
      playerField.repopulate();
      refreshGame(socket, game, playerField);
    });
  });

  socket.on('ready', function (gameName) {
    withPlayerAndGame(gameName, function (playerField, game) {
      playerField.confirmReady();
      refreshGame(socket, game, playerField);
      broadcastGameRoom(game, game.getOpponent(playerField));
    });
  });

  socket.on('shoot', function (data) {
    withPlayerAndGame(data.name, function (playerField, game) {
      if (game.isGameOver())
        return handleError('The game is over.');
      if (!game.getCreator().isReady() || game.getVisitor() === null || !game.getVisitor().isReady())
        return handleError('The game hasn\'t started.');
      if (!game.isActive(playerField))
        return handleError('It\'s not your turn.');
      var shotField;
      try {
        shotField = game.shoot(data.x, data.y);
      } catch (e) {
        return handleError(e);
      }
      refreshGame(socket, game, playerField);
      broadcastGameRoom(game, game.getOpponent(playerField));
    });
  });

  socket.on('disconnect', function () {
    // todo
  });
});
