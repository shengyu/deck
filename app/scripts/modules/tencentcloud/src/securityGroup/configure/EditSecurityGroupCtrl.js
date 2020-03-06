'use strict';

import * as angular from 'angular';

import { SecurityGroupWriter, TaskMonitor, FirewallLabels } from '@spinnaker/core';
import UIROUTER_ANGULARJS from '@uirouter/angularjs';

export const TENCENTCLOUD_SECURITYGROUP_CONFIGURE_EDITSECURITYGROUPCTRL =
  'spinnaker.tencentcloud.securityGroup.edit.controller';
export const name = TENCENTCLOUD_SECURITYGROUP_CONFIGURE_EDITSECURITYGROUPCTRL;
angular
  .module(TENCENTCLOUD_SECURITYGROUP_CONFIGURE_EDITSECURITYGROUPCTRL, [UIROUTER_ANGULARJS])
  .controller('tencentCloudEditSecurityGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    '$state',
    'application',
    'securityGroup',
    '$controller',
    function($scope, $uibModalInstance, $state, application, securityGroup, $controller) {
      $scope.pages = {
        ingress: require('./createSecurityGroupIngress.html'),
      };

      $scope.securityGroup = securityGroup;

      $scope.state = {
        refreshingSecurityGroups: false,
      };

      $scope.securityGroup.regions = [$scope.securityGroup.region];
      $scope.securityGroup.credentials = $scope.securityGroup.accountName;
      const ctrl = this;
      ctrl.protocolChange = rule => {
        if (rule.protocol === 'ICMP') {
          rule.port = '';
        }
      };
      angular.extend(
        this,
        $controller('tencentCloudConfigSecurityGroupMixin', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          application: application,
          securityGroup: securityGroup,
        }),
      );

      $scope.state.isNew = false;

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: `Updating your ${FirewallLabels.get('firewall')}`,
        modalInstance: $uibModalInstance,
        onTaskComplete: () => application.securityGroups.refresh(),
      });

      securityGroup.securityGroupIngress = securityGroup.inRules
        ? securityGroup.inRules.map(inRule => ({
            index: inRule.index,
            protocol: inRule.protocol,
            port: inRule.port,
            cidrBlock: inRule.cidrBlock,
            action: inRule.action,
            existing: true,
          }))
        : [];

      this.upsert = function() {
        const command = {
          application: application.name,
          account: $scope.securityGroup.accountName,
          accountName: $scope.securityGroup.accountName,
          credentials: $scope.securityGroup.accountName,
          cloudProvider: 'tencentcloud',
          securityGroupId: $scope.securityGroup.id,
          securityGroupName: $scope.securityGroup.name,
          name: $scope.securityGroup.name, // upsertSecurityGroup will override securityGroupName
          securityGroupDesc: $scope.securityGroup.description,
          region: $scope.securityGroup.region,
          inRules: $scope.securityGroup.securityGroupIngress.map(inRule => ({
            index: inRule.index,
            protocol: inRule.protocol,
            port: inRule.protocol == 'ICMP' ? undefined : inRule.port,
            cidrBlock: inRule.cidrBlock,
            action: inRule.action,
          })),
        };

        $scope.taskMonitor.submit(function() {
          return SecurityGroupWriter.upsertSecurityGroup(command, application, 'Update');
        });
      };

      this.cancel = function() {
        $uibModalInstance.dismiss();
      };

      this.initializeSecurityGroups().then(this.initializeAccounts);
    },
  ]);
