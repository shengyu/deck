'use strict';

import { module } from 'angular';

import { TaskExecutor, TaskMonitor } from '@spinnaker/core';
import { TENCENTCLOUD_SERVERGROUP_CONFIGURE_SERVERGROUPCOMMANDBUILDER_SERVICE } from 'tencentcloud/serverGroup/configure/serverGroupCommandBuilder.service';

export const TENCENTCLOUD_SERVERGROUP_DETAILS_ADVANCEDSETTINGS_EDITASGADVANCEDSETTINGS_MODAL_CONTROLLER =
  'spinnaker.tencentcloud.serverGroup.editAsgAdvancedSettings.modal.controller';
module(TENCENTCLOUD_SERVERGROUP_DETAILS_ADVANCEDSETTINGS_EDITASGADVANCEDSETTINGS_MODAL_CONTROLLER, [
  TENCENTCLOUD_SERVERGROUP_CONFIGURE_SERVERGROUPCOMMANDBUILDER_SERVICE,
]).controller('tencentCloudEditAsgAdvancedSettingsCtrl', [
  '$scope',
  '$uibModalInstance',
  'application',
  'serverGroup',
  'tencentCloudServerGroupCommandBuilder',
  function($scope, $uibModalInstance, application, serverGroup, tencentCloudServerGroupCommandBuilder) {
    $scope.command = tencentCloudServerGroupCommandBuilder.buildUpdateServerGroupCommand(serverGroup);

    $scope.serverGroup = serverGroup;

    $scope.taskMonitor = new TaskMonitor({
      application: application,
      title: 'Update Advanced Settings for ' + serverGroup.name,
      modalInstance: $uibModalInstance,
      onTaskComplete: () => application.serverGroups.refresh(),
    });

    this.submit = () => {
      const job = [$scope.command];

      const submitMethod = function() {
        return TaskExecutor.executeTask({
          job: job,
          application: application,
          description: 'Update Advanced Settings for ' + serverGroup.name,
        });
      };

      $scope.taskMonitor.submit(submitMethod);
    };

    this.cancel = $uibModalInstance.dismiss;
  },
]);
