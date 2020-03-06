import { IController, IPromise, IQService, IScope, module } from 'angular';
import { StateService } from '@uirouter/angularjs';

import { Application, ILoadBalancer, MANAGED_RESOURCE_DETAILS_INDICATOR } from '@spinnaker/core';

import { ITencentCloudApplicationLoadBalancer, ITargetGroup } from 'tencentcloud/domain/ITencentCloudLoadBalancer';
import UIROUTER_ANGULARJS from '@uirouter/angularjs';

export interface ITargetGroupFromStateParams {
  accountId: string;
  region: string;
  name: string;
  loadBalancerName: string;
  vpcId: string;
}

export class TencentCloudTargetGroupDetailsController implements IController {
  private targetGroupFromParams: ITargetGroupFromStateParams;
  public application: Application;
  public state = { loading: true };
  public clbProtocol: string;
  public targetGroup: ITargetGroup;
  public loadBalancer: ITencentCloudApplicationLoadBalancer;

  public static $inject = ['$scope', '$q', '$state', 'targetGroup', 'app'];
  constructor(
    private $scope: IScope,
    private $q: IQService,
    private $state: StateService,
    targetGroup: ITargetGroupFromStateParams,
    private app: Application,
  ) {
    this.application = app;
    this.targetGroupFromParams = targetGroup;

    this.app
      .ready()
      .then(() => this.extractTargetGroup())
      .then(() => {
        // If the user navigates away from the view before the initial extractTargetGroup call completes,
        // do not bother subscribing to the refresh
        if (!$scope.$$destroyed) {
          app.getDataSource('loadBalancers').onRefresh($scope, () => this.extractTargetGroup());
        }
      });
  }

  public autoClose(): void {
    if (this.$scope.$$destroyed) {
      return;
    }
    this.$state.params.allowModalToStayOpen = true;
    this.$state.go('^', null, { location: 'replace' });
  }

  public extractTargetGroup(): IPromise<void> {
    const { loadBalancerName, region, accountId, name } = this.targetGroupFromParams;

    const appLoadBalancer: ITencentCloudApplicationLoadBalancer = this.app.loadBalancers.data.find(
      (test: ILoadBalancer) => {
        return test.name === loadBalancerName && test.region === region && test.account === accountId;
      },
    );
    if (!appLoadBalancer) {
      this.autoClose();
      return this.$q.when(null);
    }

    const targetGroup = appLoadBalancer.targetGroups.find((tg: any) => tg.name === name);
    if (!targetGroup) {
      this.autoClose();
      return this.$q.when(null);
    }

    // All the other details controllers get the latest from the server again, since target groups are currently only returned
    // as a part of a load balancer, we don't have a good way of getting the latest from the server. If this small delay does
    // end up causing problems, we can add a /targetGroups controller to clouddriver and expose it in gate like the
    // loadBalancer controller.
    this.targetGroup = targetGroup;
    this.loadBalancer = appLoadBalancer;
    this.state.loading = false;

    this.clbProtocol = 'http:';
    if (this.loadBalancer.listeners && this.loadBalancer.listeners.some((l: any) => l.protocol === 'HTTPS')) {
      this.clbProtocol = 'https:';
    }

    return this.$q.when(null);
  }
}

export const TENCENTCLOUD_TARGET_GROUP_DETAILS_CTRL =
  'spinnaker.tencentcloud.loadBalancer.details.targetGroupDetails.controller';
module(TENCENTCLOUD_TARGET_GROUP_DETAILS_CTRL, [UIROUTER_ANGULARJS, MANAGED_RESOURCE_DETAILS_INDICATOR]).controller(
  'tencentCloudTargetGroupDetailsCtrl',
  TencentCloudTargetGroupDetailsController,
);
