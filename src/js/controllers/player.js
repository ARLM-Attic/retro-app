angular.module('retro').controller('PlayerController',
    ($scope, Player) => {
        $scope.player = Player.get();
        Player.observer.then(null, null, (player) => $scope.player = player);
    }
);