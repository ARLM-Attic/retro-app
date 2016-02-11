angular.module('retro').controller('BattleController',
    ($scope, $ionicModal, BattleFlow, Battle, Dice, Player, Skills) => {
        $scope.battleFlow = BattleFlow;
        $scope.currentPlayerName = Player.get().name;
        $scope.targets = {};

        const modals = {
            targetModal: null,
            resultsModal: null
        };
        let me = null;

        const resultHandler = ({ battle, actions, isDone }) => {
            Battle.set(battle);
            $scope.disableActions = false;
            $scope.targets = {};
            $scope.results = actions;
            $scope.isDone = isDone;
            modals.resultsModal.show();
            if(isDone) {
                Battle.set(null);
            }
        };

        const setupBattleData = () => {
            $scope.battle = Battle.get();
            if(!$scope.battle) { return; }
            $scope.battle.actionChannel.watch($scope.setTarget);

            $scope.battle.resultsChannel.watch(resultHandler);

            // self shows up last
            $scope.orderedPlayers = _($scope.battle.players)
                .sortBy((player) => {
                    return player === $scope.currentPlayerName ? '~' : player;
                }).map(playerName => {
                    return _.find($scope.battle.playerData, {name: playerName});
                })
                .value();

            me = _.find($scope.battle.playerData, { name: $scope.currentPlayerName });

            $scope.uniqueSkills = _(me.skills)
                .reject(skill => skill === 'Attack')
                .compact()
                .uniq()
                .value();
        };

        $scope.openSkillInfo = (skill) => {
            $scope.activeSkill = _.find(Skills.get(), { spellName: skill });

            $scope.multiplier = _.filter(me.skills, check => check === skill).length;
            if(skill === 'Attack') {
                $scope.multiplier += 1;
            }

            const skillRef = $scope.activeSkill;
            $scope.activeSkillAttrs = _(skillRef.spellEffects)
                .keys()
                .map(key => {
                    const stats = Dice.statistics(skillRef.spellEffects[key].roll, me.stats);
                    return { name: key, value: stats, extra: skillRef.spellEffects[key] };
                })
                // Damage always comes first
                .sortBy((obj) => obj.name === 'Damage' ? '*' : obj.name)
                .value();

            modals.targetModal.show();
        };

        $scope.target = {
            monster: (monster) => $scope.prepareTarget({ name: monster.name, id: monster.id, skill: $scope.activeSkill.spellName }),
            player: (player) => $scope.prepareTarget({ name: player.name, id: player.name, skill: $scope.activeSkill.spellName }),
            other: (other) => $scope.prepareTarget({ name: other, id: other, skill: $scope.activeSkill.spellName })
        };

        $scope.closeModal = (modal) => {
            modals[modal].hide();
            if($scope.isDone) {
                BattleFlow.toExplore();
            }
        };

        $scope.prepareTarget = (target) => {
            target.origin = $scope.currentPlayerName;
            $scope.setTarget(target);
            $scope.battle.actionChannel.publish(target);
            $scope.canConfirm = true;
            $scope.closeModal('targetModal');
        };

        $scope.setTarget = (target) => {
            $scope.targets[target.origin] = target;
        };

        $scope.confirmAction = () => {
            $scope.canConfirm = false;
            $scope.disableActions = true;
            BattleFlow.confirmAction($scope.targets[$scope.currentPlayerName]);
        };

        $ionicModal.fromTemplateUrl('choosetarget.info', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then((modal) => {
            modals.targetModal = modal;
        });

        $ionicModal.fromTemplateUrl('results.info', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then((modal) => {
            modals.resultsModal = modal;
        });

        // clean up modal b/c memory
        $scope.$on('$destroy', () => {
            modals.targetModal.remove();
            modals.resultsModal.remove();
        });

        setupBattleData();
        Battle.observer().then(null, null, setupBattleData);

        /*
        TODO make buffbar
            - ion-flash - shocked
            - ion-eye-disabled - blinded
            - ion-fireball - burned
            - ion-ios-snowy - frozen
            - ion-load-b - stunned
         */
    }
);