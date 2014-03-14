var Player = require('./Player');

var LoginController = function(socket, environment) {
  socket.on('register', function (data) {
    var newPlayer = new Player({ name: data.name, password: data.password });
    newPlayer.save(function (err) {
      if (err)
        return environment.handleError('Error creating new player: ' + err);
      console.log('SAVED', newPlayer);
      login(newPlayer);
    });
  });

  socket.on('login', function (data) {
    Player.findOne({ 'name': data.name }, function (err, player) {
      if (err)
        return environment.handleError(err);
      if (!player)
        return environment.handleError('Player with name <' + data.name + '> not found.');
      if (data.password !== player.password)
        return environment.handleError('Wrong password.');
      login(player);
    });
  });

  function login(player) {
    socket.set('player', player);
    console.log('LOGGED IN', player);
    socket.emit('logged in');
  }
};

module.exports = LoginController;