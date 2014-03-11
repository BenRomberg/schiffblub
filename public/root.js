angular.module('root', [])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/login', {templateUrl: 'partials/login.html', controller: LoginController})
      .when('/game', {templateUrl: 'partials/game.html', controller: GameController})
      .otherwise({redirectTo: '/login'});
  }])
  .run(function ($rootScope) {

  });
