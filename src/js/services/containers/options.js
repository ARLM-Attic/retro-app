angular.module('retro').service('Options', ($q) => {

    const defer = $q.defer();

    let settings = {};

    const updateSettings = (newSettings) => {
        settings = newSettings;
        defer.notify(settings);
    };

    return {
        observer: defer.promise,
        apply: () => {
            defer.notify(settings);
        },
        set: updateSettings,
        get: () => settings
    };
});