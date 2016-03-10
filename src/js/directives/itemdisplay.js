angular.module('retro').directive('itemDisplay', () => {
    return {
        restrict: 'E',
        scope: {
            item: '=',
            footerButton: '=',
            headerIconButton: '=',
            showTagline: '=',
            playerLevel: '=',
            sellModifier: '='
        },
        controller: ($scope) => {
            $scope.isEmpty = _.isEmpty;
            $scope.value = () => Math.floor($scope.item.value / ($scope.sellModifier || 1));

            const determineQualityColor = (quality) => {
                switch(quality) {
                    case 2:  return 'dark';
                    case 3:  return 'energized';
                    case 4:  return 'assertive';
                    case 10: return 'royal';
                    default: return '';
                }
            };

            $scope.qualityColor = determineQualityColor($scope.item.quality);
        },
        template: `
            <div class="card">
                <div class="item item-divider">
                    <h2 class="item-display">
                        <span>{{item.name}}</span>
                        <span class="pull-right" ng-if="headerIconButton">
                            <button
                                ng-click="headerIconButton.click()"
                                class="button button-small">
                                <i class="icon {{headerIconButton.iconClass}}"></i>
                            </button>
                        </span>
                    </h2>
                    <p ng-if="showTagline" ng-class="{ assertive: playerLevel > item.levelRequirement }">
                        <i class="icon ion-star {{qualityColor}}" ng-if="item.quality > 1"></i> Level {{item.levelRequirement || 1}} {{item.type}}
                    </p>
                </div>
                <div class="item item-body" ng-if="!isEmpty(item.stats)">
                    <div class="row">
                        <div class="col" ng-repeat="stat in ['str', 'mnt', 'dex', 'vit', 'luk']" ng-if="item.stats[stat]">
                            <color-text pre-text="{{stat.toUpperCase()}}" value="item.stats[stat]"></color-text>
                        </div>
                    </div>
                </div>
                <div class="item item-footer" ng-if="footerButton">
                    <button
                        ng-if="!item.isDefault"
                        blocked-by="{{footerButton.blockedBy}}"
                        ng-disabled="footerButton.disabled(item)"
                        ng-click="footerButton.click(item)"
                        class="button button-small button-xs button-assertive">
                        {{footerButton.text}}
                    </button>
                    <gold-display value="value()" extra-info="item.isDefault ? 'Unsellable' : ''"></gold-display>
                </div>
            </div>
            `
    };
});