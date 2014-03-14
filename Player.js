var mongoose = require('mongoose');

var Player = mongoose.model('Player', {
  name: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  gamesWon: { type: Number, default: 0 },
  gamesLost: { type: Number, default: 0 }
});

module.exports = Player;