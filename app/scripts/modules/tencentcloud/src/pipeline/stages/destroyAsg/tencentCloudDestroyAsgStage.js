'use strict';

import { module } from 'angular';

import { AccountService, Registry, StageConstants } from '@spinnaker/core';

export const TENCENTCLOUD_PIPELINE_STAGES_DESTROYASG_TENCENTCLOUDDESTROYASGSTAGE =
  'spinnaker.tencentcloud.pipeline.stage.tencentcloud.destroyAsgStage';
module(TENCENTCLOUD_PIPELINE_STAGES_DESTROYASG_TENCENTCLOUDDESTROYASGSTAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'destroyServerGroup',
      alias: 'destroyAsg',
      cloudProvider: 'tencentcloud',
      templateUrl: require('./destroyAsgStage.html'),
      executionStepLabelUrl: require('./destroyAsgStepLabel.html'),
      accountExtractor: stage => [stage.context.credentials],
      configAccountExtractor: stage => [stage.credentials],
      validators: [
        {
          type: 'targetImpedance',
          message:
            'This pipeline will attempt to destroy a server group without deploying a new version into the same cluster.',
        },
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    });
  })
  .controller('tencentCloudDestroyAsgStageCtrl', [
    '$scope',
    function($scope) {
      const stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('tencentcloud').then(function(accounts) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });
      // TODO Shengyu regions???
      $scope.regions = ['us-east-1', 'us-west-1', 'eu-west-1', 'us-west-2'];

      $scope.targets = StageConstants.TARGET_LIST;

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'tencentcloud';

      if (!stage.credentials && $scope.application.defaultCredentials.tencentcloud) {
        stage.credentials = $scope.application.defaultCredentials.tencentcloud;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.tencentcloud) {
        stage.regions.push($scope.application.defaultRegions.tencentcloud);
      }

      if (!stage.target) {
        stage.target = $scope.targets[0].val;
      }
    },
  ]);
