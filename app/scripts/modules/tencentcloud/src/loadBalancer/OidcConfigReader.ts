import { IPromise } from 'angular';

import { API } from '@spinnaker/core';
import { ITencentCloudLoadBalancerSourceData, ITencentCloudServerGroup } from 'tencentcloud';
import { IInstance, ISubnet } from 'tencentcloud/domain';

export interface IAuthenticateOidcActionConfig {
  availabilityZones?: string[];
  credentials?: string;
  detachedInstances?: IInstance[];
  clb?: ITencentCloudLoadBalancerSourceData;
  isInternal?: boolean;
  regionZones: string[];
  serverGroups: ITencentCloudServerGroup[];
  subnets?: string[];
  subnetDetails?: ISubnet[];
  subnetType?: string;
  subnetId?: string;
  id?: string;
  loadBalancerId?: string;
}

export class OidcConfigReader {
  public static getOidcConfigsByApp(app: string): IPromise<IAuthenticateOidcActionConfig[]> {
    return API.one('oidcConfigs')
      .withParams({ app })
      .getList();
  }
}
