angular.module('retro').controller('BattleController',
    ($scope, $ionicModal, $timeout, BattleFlow, Battle, Dice, Player, Skills, MapDrawing, Options, AttributeCalculator) => {
        $scope.battleFlow = BattleFlow;
        $scope.currentPlayerName = Player.get().name;
        $scope.targets = {};
        $scope.multiplier = 1;

        $scope.me = null;

        const resultHandler = ({ battle, actions, isDone }) => {
            Battle.set(battle);
            $scope.disableActions = false;
            $scope.targets = {};
            $scope.results = actions;
            $scope.isDone = isDone;

            const options = Options.get();

            if(!options.skipRoundResults || isDone) {
                $ionicModal.fromTemplateUrl('results.info', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then((modal) => {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            }

            if(isDone) {
                if(!battle.isFled) {
                    _.each(battle.monsters, monster => MapDrawing.hideMonster(monster.id));
                }
                Battle.set(null);
            }
        };

        const battleSetter = ({ battle }) => {
            Battle.set(battle);
        };

        const actionHandler = (target) => $timeout($scope.setTarget(target));

        const updateBattleData = () => {
            $scope.battle = Battle.get();
            if(!$scope.battle) return;

            // self shows up last
            $scope.orderedPlayers = _($scope.battle.players)
                .sortBy((player) => {
                    return player === $scope.currentPlayerName ? '~' : player;
                }).map(playerName => {
                    return _.find($scope.battle.playerData, { name: playerName });
                })
                .value();

            $scope.me = _.find($scope.battle.playerData, { name: $scope.currentPlayerName });

            $scope.hasItems = _($scope.me.itemUses).values().reduce((prev, cur) => prev + cur, 0);
        };

        const initBattleData = () => {
            $scope.battle = Battle.get();
            $scope.battle.channels.actions.watch(actionHandler);
            $scope.battle.channels.results.watch(resultHandler);
            $scope.battle.channels.updates.watch(battleSetter);

            $scope.me = _.find($scope.battle.playerData, { name: $scope.currentPlayerName });
            $scope.uniqueSkills = _($scope.me.skills)
                .reject(skill => skill === 'Attack')
                .compact()
                .uniq()
                .map(skill => _.find(Skills.get(), { spellName: skill }))
                .value();

            updateBattleData();
        };

        const clearBattleData = (battle) => {
            battle.channels.actions.unwatch(actionHandler);
            battle.channels.results.unwatch(resultHandler);
            battle.channels.updates.unwatch(battleSetter);
        };

        $scope.openSkillInfo = (skill) => {
            $scope.activeSkill = AttributeCalculator.modifySkill(_.find(Skills.get(), { spellName: skill }));

            $ionicModal.fromTemplateUrl('choosetarget.skill', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then((modal) => {
                $scope.modal = modal;
                $scope.modal.show();
            });
        };

        $scope.openItemInfo = (item) => {
            $scope.activeItem = _.find(Player.get().inventory, { name: item });

            $ionicModal.fromTemplateUrl('choosetarget.item', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then((modal) => {
                $scope.modal = modal;
                $scope.modal.show();
            });
        };

        $scope.closeModal = () => {
            $scope.modal.hide();
            $scope.modal.remove();
        };

        $scope.prepareTarget = (target) => {
            target.origin = $scope.currentPlayerName;
            $scope.setTarget(target);
            $scope.battle.channels.actions.publish(target);
            $scope.canConfirm = true;
            $scope.closeModal();

            const options = Options.get();
            if(options.autoConfirmAttacks) {
                if(options.autoConfirmAttacksIfOnly && _.filter($scope.battle.playerData, p => p.stats.hp.__current !== 0).length === 1) {
                    $scope.confirmAction();
                } else {
                    $scope.confirmAction();
                }
            }
        };

        $scope.setTarget = (target) => {
            $scope.targets[target.origin] = target;
        };

        $scope.confirmAction = () => {
            $scope.canConfirm = false;
            $scope.disableActions = true;
            BattleFlow.confirmAction($scope.targets[$scope.currentPlayerName]);
        };

        $scope.$on('modal.hidden', () => {
            if($scope.isDone || !Battle.get()) {
                BattleFlow.toExplore();
            }
        });

        initBattleData();
        Battle.observer().then(clearBattleData, null, updateBattleData);
    }
);