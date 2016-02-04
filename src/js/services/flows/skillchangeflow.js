angular.module('retro').service('SkillChangeFlow', (Toaster, $state, Player, socket) => {
    return {
        change: (skill, slot) => {

            var player = Player.get();

            var opts = {name: player.name, skillName: skill, skillSlot: slot};
            socket.emit('player:change:skill', opts, (err, success) => {
                var msgObj = err ? err : success;
                Toaster.show(msgObj.msg);
            });
        }
    };
});