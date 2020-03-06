import { IController, IPromise, IQService, IScope, module } from 'angular';
import { StateService } from '@uirouter/angularjs';

import {
  Application,
  MANAGED_RESOURCE_DETAILS_INDICATOR,
  IApplicationSecurityGroup,
  ILoadBalancer,
  ISecurityGroup,
  ISubnet,
  LOAD_BALANCER_READ_SERVICE,
  LoadBalancerReader,
  SETTINGS,
  SECURITY_GROUP_READER,
  SecurityGroupReader,
  SubnetReader,
  FirewallLabels,
} from '@spinnaker/core';

import {
  ITencentCloudLoadBalancer,
  ITencentCloudLoadBalancerSourceData,
  IListenerAction,
  ITargetGroup,
} from 'tencentcloud/domain';

import { LOAD_BALANCER_ACTIONS } from './loadBalancerActions.component';
import UIROUTER_ANGULARJS from '@uirouter/angularjs';

export interface ILoadBalancerFromStateParams {
  accountId: string;
  region: string;
  name: string;
}

export interface IActionDetails extends IListenerAction {
  targetGroup: ITargetGroup;
}

export class TencentCloudLoadBalancerDetailsController implements IController {
  public application: Application;
  public clbProtocol: string;
  public listeners: Array<{ in: string; actions: IActionDetails[] }>;
  public loadBalancerFromParams: ILoadBalancerFromStateParams;
  public loadBalancer: ITencentCloudLoadBalancer;
  public securityGroups: ISecurityGroup[];
  public ipAddressTypeDescription: string;
  public state = { loading: true };
  public firewallsLabel = FirewallLabels.get('Firewalls');
  public oidcConfigPath = SETTINGS.oidcConfigPath;

  public static $inject = [
    '$scope',
    '$state',
    '$q',
    'loadBalancer',
    'app',
    'securityGroupReader',
    'loadBalancerReader',
  ];
  constructor(
    private $scope: IScope,
    private $state: StateService,
    private $q: IQService,
    loadBalancer: ILoadBalancerFromStateParams,
    private app: Application,
    private securityGroupReader: SecurityGroupReader,
    private loadBalancerReader: LoadBalancerReader,
  ) {
    this.application = app;
    this.loadBalancerFromParams = loadBalancer;

    this.app
      .ready()
      .then(() => this.extractLoadBalancer())
      .then(() => {
        // If the user navigates away from the view before the initial extractLoadBalancer call completes,
        // do not bother subscribing to the refresh
        if (!$scope.$$destroyed) {
          app.getDataSource('loadBalancers').onRefresh($scope, () => this.extractLoadBalancer());
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

  public extractLoadBalancer(): IPromise<void> {
    const appLoadBalancer = this.app.loadBalancers.data.find((test: ILoadBalancer) => {
      return (
        test.name === this.loadBalancerFromParams.name &&
        test.region === this.loadBalancerFromParams.region &&
        test.account === this.loadBalancerFromParams.accountId
      );
    });

    if (appLoadBalancer) {
      const detailsLoader = this.loadBalancerReader.getLoadBalancerDetails(
        'tencentcloud',
        this.loadBalancerFromParams.accountId,
        this.loadBalancerFromParams.region,
        appLoadBalancer.id,
      );
      return detailsLoader.then(
        (details: ITencentCloudLoadBalancerSourceData[]) => {
          this.loadBalancer = appLoadBalancer;
          this.state.loading = false;
          const securityGroups: IApplicationSecurityGroup[] = [];
          if (details.length) {
            this.loadBalancer.clb = details[0];
            this.ipAddressTypeDescription = 'IPv4';
            (this.loadBalancer.clb.securityGroups || []).forEach((securityGroupId: string) => {
              const match = this.securityGroupReader.getApplicationSecurityGroup(
                this.app,
                this.loadBalancerFromParams.accountId,
                this.loadBalancerFromParams.region,
                securityGroupId,
              );
              if (match) {
                securityGroups.push(match);
              }
            });
            this.securityGroups = securityGroups;

            if (this.loadBalancer.subnetId) {
              this.loadBalancer.subnetDetails = [this.loadBalancer.subnetId].reduce(
                (subnetDetails: ISubnet[], subnetId: string) => {
                  SubnetReader.getSubnetByIdAndProvider(subnetId, this.loadBalancer.provider).then(
                    (subnetDetail: ISubnet) => {
                      subnetDetails.push(subnetDetail);
                    },
                  );

                  return subnetDetails;
                },
                [],
              );
            }
          }
        },
        () => this.autoClose(),
      );
    } else {
      this.autoClose();
    }
    if (!this.loadBalancer) {
      this.autoClose();
    }

    return this.$q.when(null);
  }
}

export const TENCENTCLOUD_LOAD_BALANCER_DETAILS_CTRL = 'spinnaker.tencentcloud.loadBalancer.details.controller';
module(TENCENTCLOUD_LOAD_BALANCER_DETAILS_CTRL, [
  UIROUTER_ANGULARJS,
  SECURITY_GROUP_READER,
  LOAD_BALANCER_ACTIONS,
  LOAD_BALANCER_READ_SERVICE,
  MANAGED_RESOURCE_DETAILS_INDICATOR,
]).controller('tencentCloudLoadBalancerDetailsCtrl', TencentCloudLoadBalancerDetailsController);
