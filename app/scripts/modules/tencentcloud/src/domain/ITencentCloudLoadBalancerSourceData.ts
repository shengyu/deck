import { ILoadBalancerSourceData } from '@spinnaker/core';

import { IALBListener } from './ITencentCloudLoadBalancer';

export interface ITencentCloudContainerServerGroupSourceData {
  detachedInstances: string[];
  isDisabled: boolean;
  name: string;
  region: string;
}

export interface ITencentCloudLoadBalancerServerGroupSourceData extends ITencentCloudContainerServerGroupSourceData {
  instances: ITencentCloudLoadBalancerInstanceSourceData[];
}

export interface ITencentCloudTargetGroupServerGroupSourceData extends ITencentCloudContainerServerGroupSourceData {
  instances: ITencentCloudTargetGroupInstanceSourceData[];
}

export interface ITencentCloudInstanceHealthSourceData {
  type: string;
  state: 'InService' | 'OutOfService' | 'Unknown';
  reasonCode: 'CLB' | 'Instance' | 'N/A';
  description: string;
}

export interface ITencentCloudTargetHealthSourceData {
  description: string;
  reason: string;
  state: 'initial' | 'healthy' | 'unhealthy' | 'unused' | 'draining';
}

export interface ITencentCloudLoadBalancerSourceData extends ILoadBalancerSourceData {
  account: string;
  availabilityZones: string[];
  cloudProvider: string;
  createdTime: number;
  dnsname: string;
  loadBalancerName: string;
  loadBalancerType?: string;
  listeners?: IALBListener[];
  id: string;
  name: string;
  region: string;
  scheme: 'internal' | 'internet-facing';
  securityGroups: string[];
  serverGroups: ITencentCloudLoadBalancerServerGroupSourceData[];
  subnets: string[];
  type: string;
  vpcId: string;
  // Some of the backend in clouddriver returns a vpcid (lowecase) only,
  // and was cached with some of that. Until caches roll off and we are
  // sure clouddriver is cleaed up, leave this dirtiness in here
  vpcid?: string;
}

export interface ITencentCloudLoadBalancerInstanceSourceData {
  id: string;
  zone: string;
  health: ITencentCloudInstanceHealthSourceData;
}

export interface ITencentCloudTargetGroupInstanceSourceData {
  id: string;
  zone: string;
  health: ITencentCloudTargetHealthSourceData;
}

export interface ITencentCloudTargetGroupSourceData {
  account: string;
  attributes: {
    'deregistration_delay.timeout_seconds': number;
    'stickiness.enabled': boolean;
    'stickiness.lb_cookie.duration_seconds': number;
    'stickiness.type': 'lb_cookie';
  };
  cloudProvider: string;
  healthCheckIntervalSeconds: number;
  healthCheckPath: string;
  healthCheckPort: string;
  healthCheckProtocol: string;
  healthCheckTimeoutSeconds: number;
  healthyThresholdCount: number;
  instances: string[];
  loadBalancerNames: string[];
  matcher: {
    httpCode: string;
  };
  name: string;
  port: number;
  protocol: string;
  region: string;
  serverGroups: ITencentCloudTargetGroupServerGroupSourceData[];
  targetGroupArn: string;
  targetGroupName: string;
  targetType: string;
  type: string;
  unhealthyThresholdCount: number;
  vpcId: string;
}
