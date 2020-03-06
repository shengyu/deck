import { AccountService, Application, IHealth, IInstance, IServerGroup, IVpc, SETTINGS } from '@spinnaker/core';
import { TencentCloudProviderSettings } from 'tencentcloud/tencentcloud.settings';
import {
  ITencentCloudApplicationLoadBalancer,
  ITencentCloudApplicationLoadBalancerUpsertCommand,
  ITencentCloudLoadBalancer,
  ITencentCloudServerGroup,
  ITargetGroup,
} from 'tencentcloud/domain';
import { VpcReader } from 'tencentcloud/vpc/VpcReader';
import { IPromise, module } from 'angular';
import { chain, filter, flatten, map } from 'lodash';

import { $q } from 'ngimport';

export class TencentCloudLoadBalancerTransformer {
  private updateHealthCounts(container: IServerGroup | ITargetGroup | ITencentCloudLoadBalancer): void {
    const instances = container.instances;

    container.instanceCounts = {
      up: instances.filter(instance => instance.health[0].state === 'InService').length,
      down: instances.filter(instance => instance.healthState === 'Down').length,
      outOfService: instances.filter(instance => instance.healthState === 'OutOfService').length,
      starting: undefined,
      succeeded: undefined,
      failed: undefined,
      unknown: undefined,
    };

    if ((container as ITargetGroup | ITencentCloudLoadBalancer).serverGroups) {
      const serverGroupInstances = flatten(
        (container as ITargetGroup).serverGroups.filter(sg => !!sg.instances).map(sg => sg.instances),
      );
      container.instanceCounts.up = serverGroupInstances.filter(
        instance => instance.health[0].state === 'InService',
      ).length;
      container.instanceCounts.down = serverGroupInstances.filter(instance => instance.healthState === 'Down').length;
      container.instanceCounts.outOfService = serverGroupInstances.filter(
        instance => instance.healthState === 'OutOfService',
      ).length;
    }
  }

  private transformInstance(instance: IInstance, provider: string, account: string, region: string): void {
    // instance in this case should be some form if instance source data, but force to 'any' type to fix
    // instnace health in load balancers until we can actually shape this bit properly
    const health: IHealth = (instance.health as any) || ({} as IHealth);
    if (health.state === 'healthy') {
      // Target groups use 'healthy' instead of 'InService' and a lot of deck expects InService
      // to surface health in the UI; just set it as InService since we don't really care the
      // specific state name... yet
      health.state = 'InService';
    }
    instance.provider = provider;
    instance.account = account;
    instance.region = region;
    instance.healthState = health.state ? (health.state === 'InService' ? 'Up' : 'Down') : 'OutOfService';
    instance.health = [health];
  }

  private addVpcNameToContainer(
    container: ITencentCloudLoadBalancer | ITargetGroup,
  ): (vpcs: IVpc[]) => ITencentCloudLoadBalancer | ITargetGroup {
    return (vpcs: IVpc[]) => {
      const match = vpcs.find(test => test.id === container.vpcId);
      container.vpcName = match ? match.name : '';
      return container;
    };
  }

  private normalizeServerGroups(
    serverGroups: IServerGroup[],
    container: ITencentCloudLoadBalancer | ITargetGroup,
    containerType: string,
    healthType: string,
  ): void {
    if (serverGroups === null) {
      serverGroups.forEach(serverGroup => {
        serverGroup.account = serverGroup.account || container.account;
        serverGroup.region = serverGroup.region || container.region;
        serverGroup.cloudProvider = serverGroup.cloudProvider || container.cloudProvider;

        if (serverGroup.detachedInstances) {
          serverGroup.detachedInstances = (serverGroup.detachedInstances as any).map((instanceId: string) => {
            return { id: instanceId } as IInstance;
          });
          serverGroup.instances = serverGroup.instances.concat(serverGroup.detachedInstances);
        } else {
          serverGroup.detachedInstances = [];
        }
        if (serverGroup.instances) {
          serverGroup.instances.forEach(instance => {
            this.transformInstance(instance, container.type, container.account, container.region);
            (instance as any)[containerType] = [container.name];
            (instance.health as any).type = healthType;
          });
          this.updateHealthCounts(serverGroup);
        }
      });
    }
  }

  private normalizeTargetGroup(targetGroup: ITargetGroup): IPromise<ITargetGroup> {
    this.normalizeServerGroups(targetGroup.serverGroups, targetGroup, 'targetGroups', 'TargetGroup');

    const activeServerGroups = filter(targetGroup.serverGroups, { isDisabled: false });
    targetGroup.provider = targetGroup.type;
    targetGroup.instances = chain(activeServerGroups)
      .map('instances')
      .flatten<IInstance>()
      .value();
    targetGroup.detachedInstances = chain(activeServerGroups)
      .map('detachedInstances')
      .flatten<IInstance>()
      .value();
    this.updateHealthCounts(targetGroup);

    return $q.all([VpcReader.listVpcs(), AccountService.listAllAccounts()]).then(([vpcs, accounts]) => {
      const tg = this.addVpcNameToContainer(targetGroup)(vpcs) as ITargetGroup;

      tg.serverGroups = tg.serverGroups.map(serverGroup => {
        const account = accounts.find(x => x.name === serverGroup.account);
        const cloudProvider = (account && account.cloudProvider) || serverGroup.cloudProvider;

        serverGroup.cloudProvider = cloudProvider;
        serverGroup.instances.forEach(instance => {
          instance.cloudProvider = cloudProvider;
          instance.provider = cloudProvider;
        });

        return { ...serverGroup, cloudProvider };
      });

      return tg;
    });
  }

  public normalizeLoadBalancer(loadBalancer: ITencentCloudLoadBalancer): IPromise<ITencentCloudLoadBalancer> {
    this.normalizeServerGroups(loadBalancer.serverGroups, loadBalancer, 'loadBalancers', 'LoadBalancer');

    let serverGroups = loadBalancer.serverGroups;
    if ((loadBalancer as ITencentCloudApplicationLoadBalancer).targetGroups) {
      const appLoadBalancer = loadBalancer as ITencentCloudApplicationLoadBalancer;
      appLoadBalancer.targetGroups.forEach(targetGroup => this.normalizeTargetGroup(targetGroup));
      serverGroups = flatten<ITencentCloudServerGroup>(map(appLoadBalancer.targetGroups, 'serverGroups'));
    }

    loadBalancer.loadBalancerType = loadBalancer.loadBalancerType || 'application';
    loadBalancer.provider = loadBalancer.type;

    const activeServerGroups = filter(serverGroups, { isDisabled: false });
    loadBalancer.instances = chain(activeServerGroups)
      .map('instances')
      .flatten<IInstance>()
      .value();
    loadBalancer.detachedInstances = chain(activeServerGroups)
      .map('detachedInstances')
      .flatten<IInstance>()
      .value();
    this.updateHealthCounts(loadBalancer);
    return VpcReader.listVpcs().then(
      (vpcs: IVpc[]) => this.addVpcNameToContainer(loadBalancer)(vpcs) as ITencentCloudLoadBalancer,
    );
  }

  public convertApplicationLoadBalancerForEditing(
    loadBalancer: ITencentCloudApplicationLoadBalancer,
  ): ITencentCloudApplicationLoadBalancerUpsertCommand {
    // Since we build up toEdit as we go, much easier to declare as any, then cast at return time.
    const toEdit: ITencentCloudApplicationLoadBalancerUpsertCommand = {
      availabilityZones: undefined,
      isInternal: loadBalancer.isInternal || loadBalancer.loadBalancerType === 'INTERNAL',
      region: loadBalancer.region,
      // loadBalancerId: loadBalancer.loadBalancerId,
      loadBalancerType: 'application',
      cloudProvider: loadBalancer.cloudProvider,
      credentials: loadBalancer.account || loadBalancer.credentials,
      listeners: loadBalancer.listeners,
      application: loadBalancer.application,
      targetGroups: [],
      name: loadBalancer.name,
      regionZones: loadBalancer.availabilityZones,
      securityGroups: loadBalancer.securityGroups || [],
      subnetType: loadBalancer.subnetId,
      subnetId: loadBalancer.subnetId,
      vpcId: loadBalancer.vpcId,
      idleTimeout: loadBalancer.idleTimeout || 60,
      deletionProtection: loadBalancer.deletionProtection || false,
    };
    return toEdit;
  }

  public constructNewApplicationLoadBalancerTemplate(
    application: Application,
  ): ITencentCloudApplicationLoadBalancerUpsertCommand {
    const defaultCredentials =
      application.defaultCredentials.tencentcloud || TencentCloudProviderSettings.defaults.account;
    const defaultRegion = application.defaultRegions.tencentcloud || TencentCloudProviderSettings.defaults.region;
    const defaultSubnetType = TencentCloudProviderSettings.defaults.subnetType;
    const defaultPort = application.attributes.instancePort || SETTINGS.defaultInstancePort;
    const defaultTargetGroupName = `targetgroup`;
    return {
      application: application.name,
      name: '',
      availabilityZones: undefined,
      stack: '',
      detail: '',
      loadBalancerType: 'application',
      isInternal: false,
      cloudProvider: 'tencentcloud',
      credentials: defaultCredentials,
      region: defaultRegion,
      vpcId: null,
      subnetId: defaultSubnetType,
      subnetType: defaultSubnetType,
      idleTimeout: 60,
      deletionProtection: false,
      targetGroups: [
        {
          name: defaultTargetGroupName,
          protocol: 'HTTP',
          port: defaultPort,
          targetType: 'instance',
          healthCheckProtocol: 'HTTP',
          healthCheckPort: 'traffic-port',
          healthCheckPath: '/healthcheck',
          healthCheckTimeout: 5,
          healthCheckInterval: 10,
          healthyThreshold: 10,
          unhealthyThreshold: 2,
          attributes: {
            deregistrationDelay: 600,
            stickinessEnabled: false,
            stickinessType: 'lb_cookie',
            stickinessDuration: 8400,
          },
        },
      ],
      regionZones: [],
      securityGroups: [],
      listeners: [
        {
          protocol: 'HTTP',
          port: 80,
          rules: [],
          isNew: true,
          healthCheck: {
            healthSwitch: 1,
            timeOut: 2,
            intervalTime: 5,
            healthNum: 3,
            unHealthNum: 3,
            showAdvancedSetting: false,
          },
        },
      ],
    };
  }
}

export const TENCENTCLOUD_LOAD_BALANCER_TRANSFORMER = 'spinnaker.tencentcloud.loadBalancer.transformer';
module(TENCENTCLOUD_LOAD_BALANCER_TRANSFORMER, []).service(
  'tencentCloudLoadBalancerTransformer',
  TencentCloudLoadBalancerTransformer,
);
