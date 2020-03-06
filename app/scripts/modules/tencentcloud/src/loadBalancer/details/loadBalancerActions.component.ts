import { module } from 'angular';
import { react2angular } from 'react2angular';

import { LoadBalancerActions } from './LoadBalancerActions';

export const LOAD_BALANCER_ACTIONS = 'spinnaker.tencentcloud.loadBalancer.details.loadBalancerActions.component';
module(LOAD_BALANCER_ACTIONS, []).component(
  'tencentCloudLoadBalancerActions',
  react2angular(LoadBalancerActions, ['app', 'loadBalancer', 'loadBalancerFromParams']),
);
