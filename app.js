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
var games = {};

io.sockets.on('connection', function (socket) {
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

  socket.on('create game', function (gameName) {
    if (games[gameName])
      return handleError('Game with name <' + gameName + '> already exists.');
    withPlayer(function (player) {
      games[gameName] = new Game(gameName, player);
      console.log('created and joined game ' + gameName);
      broadcastGameJoined(games[gameName], games[gameName].getCreator());
    });
  });

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
      game.setVisitorPlayer(player);
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
      if (!game.getCreator().isReady() || game.getVisitor() === null || !game.getVisitor().isReady())
        return handleError('The game hasn\'t started.');
      if (!game.isActive(playerField))
        return handleError('It\'s not your turn.');
      try {
        game.shoot(data.x, data.y);
      } catch (e) {
        return handleError(e);
      }
      if (game.isGameOver()) {
        delete games[game.getName()];
        listGames(socket.broadcast);
      }
      refreshGame(socket, game, playerField);
      broadcastGameRoom(game, game.getOpponent(playerField));
    });
  });

  function sendGameJoined(game, playerField) {
    socket.join(game.getName());
    socket.emit('joined game', getGameData(game, playerField));
  }

  function broadcastGameJoined(game, playerField) {
    listGames(socket.broadcast);
    sendGameJoined(game, playerField);
  }

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
        ready: playerField.isReady(),
        won: playerField.getPlayer().gamesWon,
        lost: playerField.getPlayer().gamesLost
      },
      opponent: opponent ? {
        name: opponent.getName(),
        field: opponent.getField().filterShot(),
        ready: opponent.isReady(),
        won: opponent.getPlayer().gamesWon,
        lost: opponent.getPlayer().gamesLost
      } : null
    };
  }

  function refreshGame(receiver, game, playerField) {
    receiver.emit('refresh game', getGameData(game, playerField));
  }

  function broadcastGameRoom(game, playerField) {
    if (playerField !== null)
      refreshGame(socket.broadcast.to(game.getName()), game, playerField);
  }

  function listGames(receiver) {
    var gameList = [];
    Object.keys(games).forEach(function (name) {
      var opponent = games[name].getVisitor();
      var creator = games[name].getCreator();
      gameList.push({
        name: name,
        creator: {
          name: creator.getName(),
          won: creator.getPlayer().gamesWon,
          lost: creator.getPlayer().gamesLost
        },
        opponent: opponent ? {
          name: opponent.getName(),
          won: opponent.getPlayer().gamesWon,
          lost: opponent.getPlayer().gamesLost
        } : null
      });
    });
    receiver.emit('list games', gameList);
  }

  function handleError(message) {
    console.log('ERROR', message);
    socket.emit('error', message);
  }

  function login(player) {
    socket.set('player', player);
    console.log('LOGGED IN', player);
    socket.emit('logged in');
  }
});
