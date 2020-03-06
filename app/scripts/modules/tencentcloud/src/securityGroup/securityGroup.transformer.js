'use strict';

import { module } from 'angular';

import { VpcReader } from '../vpc/VpcReader';

export const TENCENTCLOUD_SECURITYGROUP_SECURITYGROUP_TRANSFORMER = 'spinnaker.tencentcloud.securityGroup.transformer';
module(TENCENTCLOUD_SECURITYGROUP_SECURITYGROUP_TRANSFORMER, []).factory(
  'tencentCloudSecurityGroupTransformer',
  function() {
    function normalizeSecurityGroup(securityGroup) {
      return VpcReader.listVpcs().then(addVpcNameToSecurityGroup(securityGroup));
    }

    function addVpcNameToSecurityGroup(securityGroup) {
      return function(vpcs) {
        const matches = vpcs.filter(function(test) {
          return test.id === securityGroup.vpcId;
        });
        securityGroup.vpcName = matches.length ? matches[0].name : '';
      };
    }

    return {
      normalizeSecurityGroup: normalizeSecurityGroup,
    };
  },
);
