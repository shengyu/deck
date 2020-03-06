'use strict';

import { module } from 'angular';

import { TENCENTCLOUD_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_UPSERTSCALINGPOLICY_CONTROLLER } from 'tencentcloud/serverGroup/details/scalingPolicy/upsert/upsertScalingPolicy.controller';

import { SCALING_POLICY_POPOVER } from './popover/scalingPolicyPopover.component';
import { ScalingPolicyWriter } from './ScalingPolicyWriter';

import './scalingPolicySummary.component.less';
import { ConfirmationModalService } from '@spinnaker/core';

export const TENCENTCLOUD_SERVERGROUP_DETAILS_SCALINGPOLICY_ALARMBASEDSUMMARY_COMPONENT =
  'spinnaker.tencentcloud.serverGroup.details.scalingPolicy.alarmBasedSummary.component';
export const name = TENCENTCLOUD_SERVERGROUP_DETAILS_SCALINGPOLICY_ALARMBASEDSUMMARY_COMPONENT;
module(TENCENTCLOUD_SERVERGROUP_DETAILS_SCALINGPOLICY_ALARMBASEDSUMMARY_COMPONENT, [
  TENCENTCLOUD_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_UPSERTSCALINGPOLICY_CONTROLLER,
  SCALING_POLICY_POPOVER,
]).component('tencentCloudAlarmBasedSummary', {
  bindings: {
    policy: '=',
    serverGroup: '=',
    application: '=',
  },
  templateUrl: require('./alarmBasedSummary.component.html'),
  controller: [
    '$uibModal',
    function($uibModal) {
      this.popoverTemplate = require('./popover/scalingPolicyDetails.popover.html');

      this.editPolicy = () => {
        $uibModal.open({
          templateUrl: require('./upsert/upsertScalingPolicy.modal.html'),
          controller: 'tencentCloudUpsertScalingPolicyCtrl',
          controllerAs: 'ctrl',
          size: 'lg',
          resolve: {
            policy: () => this.policy,
            serverGroup: () => this.serverGroup,
            application: () => this.application,
          },
        });
      };

      this.deletePolicy = () => {
        const taskMonitor = {
          application: this.application,
          title: 'Deleting scaling policy ' + this.policy.policyName,
          onTaskComplete: () => this.application.serverGroups.refresh(),
        };

        const submitMethod = () =>
          ScalingPolicyWriter.deleteScalingPolicy(this.application, this.serverGroup, this.policy);

        ConfirmationModalService.confirm({
          header: 'Really delete ' + this.policy.policyName + '?',
          buttonText: 'Delete scaling policy',
          account: this.serverGroup.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };
    },
  ],
});
