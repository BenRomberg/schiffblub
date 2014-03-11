angular.module('root', [])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/login', {templateUrl: 'partials/login.html', controller: LoginController})
      .when('/lobby', {templateUrl: 'partials/lobby.html', controller: LobbyController})
      .when('/game', {templateUrl: 'partials/game.html', controller: GameController})
      .otherwise({redirectTo: '/login'});
  }])
  .run(function ($rootScope) {

  })
  .factory('socket', function ($rootScope) {
    var socket = io.connect('http://localhost:3000');
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  });
;
