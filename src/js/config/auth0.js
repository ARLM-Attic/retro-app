angular.module('retro')
    .run((auth, $localStorage, $rootScope, $stateWrapper, jwtHelper, AuthData, Config) => {
        auth.init({
            domain: 'reactive-retro.auth0.com',
            clientID: 'ucMSnNDYLGdDBL2uppganZv2jKzzJiI0',
            loginState: 'home'
        });

        auth.hookEvents();

        if(Config._cfg !== $localStorage.env) {
            $localStorage.profile = $localStorage.token = $localStorage.refreshingToken = null;
            return;
        }

        let refreshingToken = null;
        $rootScope.$on('$locationChangeStart', (e, n, c) => {
            // if you route to the same state and aren't logged in, don't do this event
            // it causes the login events on the server to fire twice
            if(n === c) return;
            if(AuthData.get().isLoggedIn) return;

            const { token, refreshToken, profile } = $localStorage;
            if(!token) { return; }

            if (!jwtHelper.isTokenExpired(token)) {
                if (!auth.isAuthenticated) {
                    auth.authenticate(profile, token);
                }
                return;
            }

            if (refreshToken) {
                if (refreshingToken === null) {
                    refreshingToken = auth.refreshIdToken(refreshToken).then((idToken) => {
                        $localStorage.token = idToken;
                        auth.authenticate(profile, idToken);
                    }).finally(() => {
                        refreshingToken = null;
                    });
                }
                return refreshingToken;
            }

            $stateWrapper.noGoingBackAndNoCache('home');
        });
    });