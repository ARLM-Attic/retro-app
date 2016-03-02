angular.module('retro').controller('InventoryController',
    ($scope, $ionicPopup, Player, EquipFlow, Settings) => {
        $scope.player = Player.get();
        Player.observer.then(null, null, (player) => $scope.player = player);
        $scope.isEmpty = _.isEmpty;

        $scope.EquipFlow = EquipFlow;
        $scope.maxInvSize = Settings.INVENTORY_SIZE;

        $scope.tryToSell = (item) => {
            const value = Math.floor(item.value/$scope.player.sellModifier);
            const confirmPopup = $ionicPopup.confirm({
                title: `Sell ${item.name}`,
                template: `Are you sure you want to sell this for ${value} gold?`
            });

            confirmPopup.then((res) => {
                if(!res) return;
                EquipFlow.sell(item);
            });
        };
    }
);