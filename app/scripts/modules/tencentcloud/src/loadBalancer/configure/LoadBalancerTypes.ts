import { ILoadBalancerModalProps } from '@spinnaker/core';

import { ITencentCloudLoadBalancerUpsertCommand } from 'tencentcloud/domain';

import { CreateApplicationLoadBalancer } from './application/CreateApplicationLoadBalancer';

export interface ICloseableLoadBalancerModal extends React.ComponentClass<ILoadBalancerModalProps> {
  show: (props: ILoadBalancerModalProps) => Promise<ITencentCloudLoadBalancerUpsertCommand>;
}

export interface ITencentCloudLoadBalancerConfig {
  type: string;
  label: string;
  sublabel: string;
  description: string;
  component: ICloseableLoadBalancerModal;
}

export const LoadBalancerTypes: ITencentCloudLoadBalancerConfig[] = [
  {
    type: 'application',
    label: 'Application',
    sublabel: 'ALB',
    description: 'Highly configurable, application-focused balancer. HTTP and HTTPS only.',
    component: CreateApplicationLoadBalancer,
  },
];
