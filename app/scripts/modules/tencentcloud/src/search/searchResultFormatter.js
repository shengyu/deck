'use strict';

import { module } from 'angular';

import { VpcReader } from '../vpc/VpcReader';

export const TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER = 'spinnaker.tencentcloud.search.searchResultFormatter';
export const name = TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER; // for backwards compatibility
module(TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER, []).factory('tencentCloudSearchResultFormatter', function() {
  return {
    securityGroups: function(entry) {
      return VpcReader.getVpcName(entry.vpcId).then(function(vpcName) {
        const region = vpcName ? entry.region + ' - ' + vpcName.toLowerCase() : entry.region;
        return entry.name + ' (' + region + ')';
      });
    },
  };
});
