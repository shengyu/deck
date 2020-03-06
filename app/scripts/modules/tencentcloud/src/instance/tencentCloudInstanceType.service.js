'use strict';

import { module } from 'angular';
import _ from 'lodash';

import { API } from '@spinnaker/core';
import { TencentCloudProviderSettings } from 'tencentcloud/tencentcloud.settings';

export const TENCENTCLOUD_INSTANCE_TENCENTCLOUDINSTANCETYPE_SERVICE = 'spinnaker.tencentcloud.instanceType.service';

module(TENCENTCLOUD_INSTANCE_TENCENTCLOUDINSTANCETYPE_SERVICE, []).factory('tencentCloudInstanceTypeService', [
  '$http',
  '$q',
  function($http, $q) {
    const m5 = {
      type: 'm5',
      description:
        'm5 instances provide a balance of compute, memory, and network resources. They are a good choice for most applications.',
      instanceTypes: [
        {
          name: 'm5.large',
          label: 'Large',
          cpu: 2,
          memory: 8,
          storage: { type: 'EBS' },
          costFactor: 1,
        },
        {
          name: 'm5.xlarge',
          label: 'XLarge',
          cpu: 4,
          memory: 16,
          storage: { type: 'EBS' },
          costFactor: 2,
        },
        {
          name: 'm5.2xlarge',
          label: '2XLarge',
          cpu: 8,
          memory: 32,
          storage: { type: 'EBS' },
          costFactor: 4,
        },
      ],
    };

    const t2gp = {
      type: 't2',
      description:
        't2 instances are a good choice for workloads that don’t use the full CPU often or consistently, but occasionally need to burst (e.g. web servers, developer environments and small databases).',
      instanceTypes: [
        {
          name: 't2.small',
          label: 'Small',
          cpu: 1,
          memory: 2,
          storage: { type: 'EBS' },
          costFactor: 1,
        },
        {
          name: 't2.medium',
          label: 'Medium',
          cpu: 2,
          memory: 4,
          storage: { type: 'EBS' },
          costFactor: 1,
        },
      ],
    };

    const t2 = {
      type: 't2',
      description:
        't2 instances are a good choice for workloads that don’t use the full CPU often or consistently, but occasionally need to burst (e.g. web servers, developer environments and small databases).',
      instanceTypes: [
        {
          name: 't2.nano',
          label: 'Nano',
          cpu: 1,
          memory: 0.5,
          storage: { type: 'EBS' },
          costFactor: 1,
        },
        {
          name: 't2.micro',
          label: 'Micro',
          cpu: 1,
          memory: 1,
          storage: { type: 'EBS' },
          costFactor: 1,
        },
        {
          name: 't2.small',
          label: 'Small',
          cpu: 1,
          memory: 2,
          storage: { type: 'EBS' },
          costFactor: 1,
        },
      ],
    };

    const r5 = {
      type: 'r5',
      description:
        'r5 instances are optimized for memory-intensive applications and have the lowest cost per GiB of RAM among Amazon EC2 instance types.',
      instanceTypes: [
        {
          name: 'r5.large',
          label: 'Large',
          cpu: 2,
          memory: 15.25,
          storage: { type: 'EBS' },
          costFactor: 1,
        },
        {
          name: 'r5.xlarge',
          label: 'XLarge',
          cpu: 4,
          memory: 30.5,
          storage: { type: 'EBS' },
          costFactor: 2,
        },
        {
          name: 'r5.2xlarge',
          label: '2XLarge',
          cpu: 8,
          memory: 61,
          storage: { type: 'EBS' },
          costFactor: 2,
        },
        {
          name: 'r5.4xlarge',
          label: '4XLarge',
          cpu: 16,
          memory: 122,
          storage: { type: 'EBS' },
          costFactor: 3,
        },
      ],
    };

    const defaultCategories = [
      {
        type: 'general',
        label: 'General Purpose',
        families: [m5, t2gp],
        icon: 'hdd',
      },
      {
        type: 'memory',
        label: 'High Memory',
        families: [r5],
        icon: 'hdd',
      },
      {
        type: 'micro',
        label: 'Micro Utility',
        families: [t2],
        icon: 'hdd',
      },
      {
        type: 'custom',
        label: 'Custom Type',
        families: [],
        icon: 'asterisk',
      },
    ];

    const getAllTypesByRegion = function getAllTypesByRegion() {
      return API.one('instanceTypes')
        .get()
        .then(function(types) {
          return _.chain(types)
            .map(function(type) {
              return Object.assign(type, {
                key: [type.region, type.account, type.name].join(':'),
              });
            })
            .uniqBy('key')
            .groupBy('region')
            .value();
        });
    };

    function getAvailableTypesForRegions(availableRegions, selectedRegions) {
      selectedRegions = selectedRegions || [];
      let availableTypes = [];

      // prime the list of available types
      if (selectedRegions && selectedRegions.length) {
        availableTypes = _.map(availableRegions[selectedRegions[0]], 'name');
      }

      // this will perform an unnecessary intersection with the first region, which is fine
      selectedRegions.forEach(function(selectedRegion) {
        if (availableRegions[selectedRegion]) {
          availableTypes = _.intersection(availableTypes, _.map(availableRegions[selectedRegion], 'name'));
        }
      });

      return availableTypes;
    }

    const categories = defaultCategories
      .filter(({ type }) => !_.get(TencentCloudProviderSettings, 'instanceTypes.exclude.categories', []).includes(type))
      .map(category =>
        Object.assign({}, category, {
          families: category.families.filter(
            ({ type }) => !_.get(TencentCloudProviderSettings, 'instanceTypes.exclude.families', []).includes(type),
          ),
        }),
      );

    function getCategories() {
      return $q.when(categories);
    }

    return {
      getAvailableTypesForRegions,
      getAllTypesByRegion,
      getCategories,
    };
  },
]);