angular.module('retro').service('AuthFlow', ($q, $ionicHistory, Toaster, $localStorage, $state, Player, Settings, LocationWatcher, socket) => {
    var flow = {
        toPlayer: () => {
            if(!_.contains(['home', 'create'], $state.current.name)) return;

            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('player');
        },
        tryAuth: () => {
            var fail = () => $state.go('create');

            if($localStorage.profile.user_id) { // jshint ignore:line
                flow.login(_.clone($localStorage), true).then(null, fail);
            } else {
                fail();
            }
        },
        login: (NewHeroProto, swallow = false) => {
            var defer = $q.defer();

            var NewHero = {
                name: NewHeroProto.name,
                profession: NewHeroProto.profession,
                userId: NewHeroProto.profile.user_id, //jshint ignore:line
                token: NewHeroProto.token
            };

            var currentLocation = LocationWatcher.current();
            if(!currentLocation) {
                return Toaster.show('No current location. Is your GPS on?');
            }

            NewHero.homepoint = { lat: currentLocation.latitude, lon: currentLocation.longitude };

            socket.emit('login', NewHero, (err, success) => {
                if(err) {
                    defer.reject();
                } else {
                    defer.resolve();
                    Player.set(success.player);
                    _.extend(Settings, success.settings);
                    Settings.places = success.places;
                    Settings.monsters = success.monsters;
                    flow.toPlayer();
                    flow.isLoggedIn = true;
                }

                if(!swallow) {
                    var msgObj = err ? err : success;
                    Toaster.show(msgObj.msg);
                }
            });

            Settings.isReady = defer.promise;
            return Settings.isReady;
        }
    };
    return flow;
});