'use strict';

import { module } from 'angular';

import { Registry, PipelineConfigService, StageConstants } from '@spinnaker/core';

export const TENCENTCLOUD_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE =
  'spinnaker.tencentcloud.pipeline.stage.tagImageStage';
module(TENCENTCLOUD_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'upsertImageTags',
      cloudProvider: 'tencentcloud',
      templateUrl: require('./tagImageStage.html'),
      executionDetailsUrl: require('./tagImageExecutionDetails.html'),
      executionConfigSections: ['tagImageConfig', 'taskStatus'],
    });
  })
  .controller('tencentCloudTagImageStageCtrl', [
    '$scope',
    $scope => {
      $scope.stage.tags = $scope.stage.tags || {};
      $scope.stage.cloudProvider = $scope.stage.cloudProvider || 'tencentcloud';

      const initUpstreamStages = () => {
        const upstreamDependencies = PipelineConfigService.getAllUpstreamDependencies(
          $scope.pipeline,
          $scope.stage,
        ).filter(stage => StageConstants.IMAGE_PRODUCING_STAGES.includes(stage.type));
        $scope.consideredStages = new Map(upstreamDependencies.map(stage => [stage.refId, stage.name]));
      };
      $scope.$watch('stage.requisiteStageRefIds', initUpstreamStages);
    },
  ]);
