angular.module('retro')
    .config(authProvider => {
        authProvider.init({
            domain: 'reactive-retro.auth0.com',
            clientID: 'ucMSnNDYLGdDBL2uppganZv2jKzzJiI0',
            loginState: 'home'
        });
    })
    .run((auth, $localStorage, $rootScope, $state, jwtHelper, AuthFlow) => {
        auth.hookEvents();

        const autologin = () => {
            if(!auth.isAuthenticated || !$localStorage.profile || !$localStorage.profile.user_id) { return; } // jshint ignore:line

            AuthFlow.login(_.clone($localStorage), true);
        };

        let refreshingToken = null;
        $rootScope.$on('$locationChangeStart', () => {

            const {token, refreshToken, profile} = $localStorage;
            if(!token) { return; }

            if (!jwtHelper.isTokenExpired(token)) {
                if (!auth.isAuthenticated) {
                    auth.authenticate(profile, token);
                }
                autologin();
            } else {
                if (refreshToken) {
                    if (refreshingToken === null) {
                        refreshingToken = auth.refreshIdToken(refreshToken).then((idToken) => {
                            $localStorage.token = idToken;
                            auth.authenticate(profile, idToken);
                            autologin();
                        }).finally(() => {
                            refreshingToken = null;
                        });
                    }
                    return refreshingToken;
                } else {
                    $state.go('home');
                }
            }
        });
    });