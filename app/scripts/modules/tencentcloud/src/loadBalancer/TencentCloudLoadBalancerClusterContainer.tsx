import * as React from 'react';
import { isEqual } from 'lodash';

import { ILoadBalancerClusterContainerProps } from '@spinnaker/core';

import { ITencentCloudApplicationLoadBalancer } from '../domain/ITencentCloudLoadBalancer';
import { TargetGroup } from './TargetGroup';

export class TencentCloudLoadBalancerClusterContainer extends React.Component<ILoadBalancerClusterContainerProps> {
  public shouldComponentUpdate(nextProps: ILoadBalancerClusterContainerProps) {
    const serverGroupsDiffer = () =>
      !isEqual(
        (nextProps.serverGroups || []).map(g => g.name),
        (this.props.serverGroups || []).map(g => g.name),
      );
    const targetGroupsDiffer = () =>
      !isEqual(
        ((nextProps.loadBalancer as ITencentCloudApplicationLoadBalancer).targetGroups || []).map(t => t.name),
        ((this.props.loadBalancer as ITencentCloudApplicationLoadBalancer).targetGroups || []).map(t => t.name),
      );
    return (
      nextProps.showInstances !== this.props.showInstances ||
      nextProps.showServerGroups !== this.props.showServerGroups ||
      nextProps.loadBalancer !== this.props.loadBalancer ||
      serverGroupsDiffer() ||
      targetGroupsDiffer()
    );
  }

  public render(): React.ReactElement<TencentCloudLoadBalancerClusterContainer> {
    const { loadBalancer, showInstances, showServerGroups } = this.props;
    const alb = loadBalancer as ITencentCloudApplicationLoadBalancer;
    const ServerGroups = alb.targetGroups
      ? alb.targetGroups.map(targetGroup => {
          return (
            <TargetGroup
              key={targetGroup.name}
              loadBalancer={loadBalancer as ITencentCloudApplicationLoadBalancer}
              targetGroup={targetGroup}
              showInstances={showInstances}
              showServerGroups={showServerGroups}
            />
          );
        })
      : [];
    return <div className="cluster-container">{ServerGroups}</div>;
  }
}
