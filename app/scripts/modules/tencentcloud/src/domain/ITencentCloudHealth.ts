import { IHealth } from '@spinnaker/core';

import { ITargetGroup } from 'tencentcloud/domain';

export interface ITencentCloudHealth extends IHealth {
  targetGroups: ITargetGroup[];
}

export interface ITencentCloudHealthCheck {
  healthSwitch: number;
  timeOut: number;
  intervalTime: number;
  healthNum: number;
  unHealthNum: number;
  httpCode?: number;
  httpCheckPath?: string;
  httpCheckDomain?: string;
  httpCheckMethod?: string;
  showAdvancedSetting: boolean;
  [key: string]: any;
}
