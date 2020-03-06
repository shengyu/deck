import * as React from 'react';
import { angular2react } from 'angular2react';
import IInjectorService = angular.auto.IInjectorService;

import { ReactInject } from '@spinnaker/core';

import { scalingPolicyDetailsSummary } from 'tencentcloud/serverGroup/details/scalingPolicy/detailsSummary.component';
import { IScalingPolicySummaryProps } from 'tencentcloud/serverGroup/details/scalingPolicy/ScalingPolicySummary';

// prettier-ignore
export class TencentCloudNgReactInjector extends ReactInject {
  public $injectorProxy = {} as IInjectorService;

  // Reactified components
  public ScalingPolicySummary: React.ComponentClass<IScalingPolicySummaryProps> = angular2react('tencentCloudScalingPolicySummary', scalingPolicyDetailsSummary, this.$injectorProxy) as any;

  public initialize($injector: IInjectorService) {
    const realInjector: { [key: string]: Function } = $injector as any;
    const proxyInjector: { [key: string]: Function } = this.$injectorProxy as any;

    Object.keys($injector)
      .filter(key => typeof realInjector[key] === 'function')
      .forEach(key => proxyInjector[key] = realInjector[key].bind(realInjector));
  }
}

export const TencentCloudNgReact = new TencentCloudNgReactInjector();
