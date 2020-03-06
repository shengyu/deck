'use strict';

import * as angular from 'angular';

import { AccountService, FirewallLabels } from '@spinnaker/core';
import { TENCENTCLOUD_SECURITYGROUP_CONFIGURE_CONFIGSECURITYGROUP_MIXIN_CONTROLLER } from '../configure/configSecurityGroup.mixin.controller';

export const TENCENTCLOUD_SECURITYGROUP_CLONE_CLONESECURITYGROUP_CONTROLLER =
  'spinnaker.tencentcloud.securityGroup.clone.controller';
export const name = TENCENTCLOUD_SECURITYGROUP_CLONE_CLONESECURITYGROUP_CONTROLLER;
angular
  .module(TENCENTCLOUD_SECURITYGROUP_CLONE_CLONESECURITYGROUP_CONTROLLER, [
    TENCENTCLOUD_SECURITYGROUP_CONFIGURE_CONFIGSECURITYGROUP_MIXIN_CONTROLLER,
  ])
  .controller('tencentCloudCloneSecurityGroupController', [
    '$scope',
    '$uibModalInstance',
    '$controller',
    'securityGroup',
    'application',
    function($scope, $uibModalInstance, $controller, securityGroup, application) {
      const vm = this;

      vm.firewallLabel = FirewallLabels.get('Firewall');

      $scope.pages = {
        location: require('../configure/createSecurityGroupProperties.html'),
        ingress: require('../configure/createSecurityGroupIngress.html'),
      };

      securityGroup.credentials = securityGroup.accountName;
      $scope.namePreview = securityGroup.name;

      angular.extend(
        this,
        $controller('tencentCloudConfigSecurityGroupMixin', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          application: application,
          securityGroup: securityGroup,
        }),
      );

      AccountService.listAccounts('tencentcloud').then(function(accounts) {
        $scope.accounts = accounts;
        vm.accountUpdated();
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
      vm.upsert = function() {
        // <account-select-field> only updates securityGroup.credentials, but Orca looks at account* before looking at credentials
        // Updating the rest of the attributes to send the correct (expected) account for all attributes
        const { credentials } = $scope.securityGroup;
        Object.assign($scope.securityGroup, {
          account: credentials,
          accountName: credentials,
          accountId: credentials,
        });

        vm.mixinUpsert('Clone');
      };

      vm.initializeSecurityGroups();
    },
  ]);
