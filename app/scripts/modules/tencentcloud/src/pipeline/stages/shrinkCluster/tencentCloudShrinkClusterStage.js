'use strict';

import { module } from 'angular';

import { AccountService, Registry } from '@spinnaker/core';

export const TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER_TENCENTCLOUDSHRINKCLUSTERSTAGE =
  'spinnaker.tencentcloud.pipeline.stage.tencentcloud.shrinkClusterStage';
module(TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER_TENCENTCLOUDSHRINKCLUSTERSTAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'shrinkCluster',
      cloudProvider: 'tencentcloud',
      templateUrl: require('./shrinkClusterStage.html'),
      accountExtractor: stage => [stage.context.credentials],
      configAccountExtractor: stage => [stage.credentials],
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'shrinkToSize', fieldLabel: 'shrink to [X] Server Groups' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    });
  })
  .controller('tencentCloudShrinkClusterStageCtrl', [
    '$scope',
    function($scope) {
      const ctrl = this;

      const stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('tencentcloud').then(function(accounts) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'tencentcloud';

      if (!stage.credentials && $scope.application.defaultCredentials.tencentcloud) {
        stage.credentials = $scope.application.defaultCredentials.tencentcloud;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.tencentcloud) {
        stage.regions.push($scope.application.defaultRegions.tencentcloud);
      }

      if (stage.shrinkToSize === undefined) {
        stage.shrinkToSize = 1;
      }

      if (stage.allowDeleteActive === undefined) {
        stage.allowDeleteActive = false;
      }

      ctrl.pluralize = function(str, val) {
        if (val === 1) {
          return str;
        }
        return str + 's';
      };

      if (stage.retainLargerOverNewer === undefined) {
        stage.retainLargerOverNewer = 'false';
      }
      stage.retainLargerOverNewer = stage.retainLargerOverNewer.toString();
    },
  ]);
