angular.module('retro').service('AuthFlow', ($q, $ionicHistory, $cordovaToast, $localStorage, $state, Player, socket) => {
    var flow = {
        toPlayer: () => {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('player');
        },
        tryAuth: () => {
            var fail = () => $state.go('create');

            if($localStorage.facebookId) {
                flow.login($localStorage).then(null, fail);
            } else {
                fail();
            }
        },
        login: (NewHero) => {
            var defer = $q.defer();

            socket.emit('login', NewHero, (err, success) => {
                if(err) {
                    defer.reject();
                } else {
                    defer.resolve();
                    Player = success.player;
                    flow.toPlayer();
                }

                var msgObj = err ? err : success;
                $cordovaToast.showLongBottom(msgObj.msg);
            });

            return defer.promise;
        }
    };
    return flow;
});