'use strict';

import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const TENCENT_MODULE = 'spinnaker.tencent';
module(TENCENT_MODULE, []).config(() => {
  CloudProviderRegistry.registerProvider('tencent', {
    name: 'tencent',
    logo: {
      path: require('./logo/tencent.logo.svg'),
    },
  });
});

DeploymentStrategyRegistry.registerProvider('tencent', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);
