import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

import { TENCENTCLOUD_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';
import { TENCENTCLOUD_REACT_MODULE } from './reactShims/tencentcloud.react.module';
import { TENCENTCLOUD_SECURITY_GROUP_MODULE } from './securityGroup/securityGroup.module';
import { TENCENTCLOUD_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';
import './validation/ApplicationNameValidator';
import { VPC_MODULE } from './vpc/vpc.module';
import { SUBNET_RENDERER } from './subnet/subnet.renderer';
import { SERVER_GROUP_DETAILS_MODULE } from './serverGroup/details/serverGroupDetails.module';
import { COMMON_MODULE } from './common/common.module';
import './help/tencentcloud.help';

import { TencentCloudImageReader } from './image';
import { TencentCloudLoadBalancerClusterContainer } from './loadBalancer/TencentCloudLoadBalancerClusterContainer';
import { TencentCloudLoadBalancersTag } from './loadBalancer/TencentCloudLoadBalancersTag';

import './deploymentStrategy/rollingPush.strategy';

import './logo/tencentcloud.logo.less';
import { TencentCloudCloneServerGroupModal } from './serverGroup/configure/wizard/TencentCloudCloneServerGroupModal';
import { CreateApplicationLoadBalancer } from './loadBalancer/configure/application/CreateApplicationLoadBalancer';
import { TencentCloudServerGroupActions } from './serverGroup/details/TencentCloudServerGroupActions';
import { tencentCloudServerGroupDetailsGetter } from './serverGroup/details/tencentCloudServerGroupDetailsGetter';

import {
  AdvancedSettingsDetailsSection,
  TencentCloudInfoDetailsSection,
  CapacityDetailsSection,
  HealthDetailsSection,
  LaunchConfigDetailsSection,
  LogsDetailsSection,
  PackageDetailsSection,
  ScalingPoliciesDetailsSection,
  // ScalingProcessesDetailsSection,
  ScheduledActionsDetailsSection,
  SecurityGroupsDetailsSection,
  TagsDetailsSection,
} from './serverGroup/details/sections';

import { TENCENTCLOUD_PIPELINE_STAGES_BAKE_BAKESTAGE } from './pipeline/stages/bake/tencentCloudBakeStage';
import { TENCENTCLOUD_PIPELINE_STAGES_CLONESERVERGROUP_TENCENTCLOUDCLONESERVERGROUPSTAGE } from './pipeline/stages/cloneServerGroup/tencentCloudCloneServerGroupStage';
import { TENCENTCLOUD_PIPELINE_STAGES_DESTROYASG_TENCENTCLOUDDESTROYASGSTAGE } from './pipeline/stages/destroyAsg/tencentCloudDestroyAsgStage';
import { TENCENTCLOUD_PIPELINE_STAGES_DISABLEASG_TENCENTCLOUDDISABLEASGSTAGE } from './pipeline/stages/disableAsg/tencentCloudDisableAsgStage';
import { TENCENTCLOUD_PIPELINE_STAGES_DISABLECLUSTER_TENCENTCLOUDDISABLECLUSTERSTAGE } from './pipeline/stages/disableCluster/tencentCloudDisableClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_ROLLBACKCLUSTER_TENCENTCLOUDROLLBACKCLUSTERSTAGE } from './pipeline/stages/rollbackCluster/tencentCloudRollbackClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_ENABLEASG_TENCENTCLOUDENABLEASGSTAGE } from './pipeline/stages/enableAsg/tencentCloudEnableAsgStage';
import { TENCENTCLOUD_PIPELINE_STAGES_FINDAMI_TENCENTCLOUDFINDAMISTAGE } from './pipeline/stages/findAmi/tencentCloudFindAmiStage';
import { TENCENTCLOUD_PIPELINE_STAGES_FINDIMAGEFROMTAGS_TENCENTCLOUDFINDIMAGEFROMTAGSSTAGE } from './pipeline/stages/findImageFromTags/tencentCloudFindImageFromTagsStage';
import { TENCENTCLOUD_PIPELINE_STAGES_MODIFYSCALINGPROCESS_MODIFYSCALINGPROCESSSTAGE } from './pipeline/stages/modifyScalingProcess/modifyScalingProcessStage';
import { TENCENTCLOUD_PIPELINE_STAGES_RESIZEASG_TENCENTCLOUDRESIZEASGSTAGE } from './pipeline/stages/resizeAsg/tencentCloudResizeAsgStage';
import { TENCENTCLOUD_PIPELINE_STAGES_SCALEDOWNCLUSTER_TENCENTCLOUDSCALEDOWNCLUSTERSTAGE } from './pipeline/stages/scaleDownCluster/tencentCloudScaleDownClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER_TENCENTCLOUDSHRINKCLUSTERSTAGE } from './pipeline/stages/shrinkCluster/tencentCloudShrinkClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE } from './pipeline/stages/tagImage/tencentCloudTagImageStage';
import { TENCENTCLOUD_INSTANCE_TENCENTCLOUDINSTANCETYPE_SERVICE } from './instance/tencentCloudInstanceType.service';
import { TENCENTCLOUD_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER } from './instance/details/instance.details.controller';
import { TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER } from './search/searchResultFormatter';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const TENCENTCLOUD_MODULE = 'spinnaker.tencentcloud';
module(TENCENTCLOUD_MODULE, [
  TENCENTCLOUD_REACT_MODULE,
  TENCENTCLOUD_PIPELINE_STAGES_BAKE_BAKESTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_CLONESERVERGROUP_TENCENTCLOUDCLONESERVERGROUPSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_DESTROYASG_TENCENTCLOUDDESTROYASGSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_DISABLEASG_TENCENTCLOUDDISABLEASGSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_DISABLECLUSTER_TENCENTCLOUDDISABLECLUSTERSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_ROLLBACKCLUSTER_TENCENTCLOUDROLLBACKCLUSTERSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_ENABLEASG_TENCENTCLOUDENABLEASGSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_FINDAMI_TENCENTCLOUDFINDAMISTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_FINDIMAGEFROMTAGS_TENCENTCLOUDFINDIMAGEFROMTAGSSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_MODIFYSCALINGPROCESS_MODIFYSCALINGPROCESSSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_RESIZEASG_TENCENTCLOUDRESIZEASGSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_SCALEDOWNCLUSTER_TENCENTCLOUDSCALEDOWNCLUSTERSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER_TENCENTCLOUDSHRINKCLUSTERSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE,
  SERVER_GROUP_DETAILS_MODULE,
  COMMON_MODULE,
  TENCENTCLOUD_SERVER_GROUP_TRANSFORMER,
  TENCENTCLOUD_INSTANCE_TENCENTCLOUDINSTANCETYPE_SERVICE,
  TENCENTCLOUD_LOAD_BALANCER_MODULE,
  TENCENTCLOUD_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER,
  TENCENTCLOUD_SECURITY_GROUP_MODULE,
  SUBNET_RENDERER,
  VPC_MODULE,
  TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER,
]).config(() => {
  CloudProviderRegistry.registerProvider('tencentcloud', {
    name: 'tencentcloud',
    logo: {
      path: require('./logo/tencentcloud.logo.svg'),
    },
    image: {
      reader: TencentCloudImageReader,
    },
    serverGroup: {
      transformer: 'tencentCloudServerGroupTransformer',
      detailsActions: TencentCloudServerGroupActions,
      detailsGetter: tencentCloudServerGroupDetailsGetter,
      detailsSections: [
        TencentCloudInfoDetailsSection,
        CapacityDetailsSection,
        HealthDetailsSection,
        LaunchConfigDetailsSection,
        SecurityGroupsDetailsSection,
        // ScalingProcessesDetailsSection,
        ScalingPoliciesDetailsSection,
        ScheduledActionsDetailsSection,
        TagsDetailsSection,
        PackageDetailsSection,
        AdvancedSettingsDetailsSection,
        LogsDetailsSection,
      ],
      CloneServerGroupModal: TencentCloudCloneServerGroupModal,
      commandBuilder: 'tencentCloudServerGroupCommandBuilder',
      configurationService: 'tencentCloudServerGroupConfigurationService',
      scalingActivitiesEnabled: true,
    },
    instance: {
      instanceTypeService: 'tencentCloudInstanceTypeService',
      detailsTemplateUrl: require('./instance/details/instanceDetails.html'),
      detailsController: 'tencentCloudInstanceDetailsCtrl',
    },
    loadBalancer: {
      transformer: 'tencentCloudLoadBalancerTransformer',
      detailsTemplateUrl: require('./loadBalancer/details/loadBalancerDetails.html'),
      detailsController: 'tencentCloudLoadBalancerDetailsCtrl',
      CreateLoadBalancerModal: CreateApplicationLoadBalancer,
      targetGroupDetailsTemplateUrl: require('./loadBalancer/details/targetGroupDetails.html'),
      targetGroupDetailsController: 'tencentCloudTargetGroupDetailsCtrl',
      ClusterContainer: TencentCloudLoadBalancerClusterContainer,
      LoadBalancersTag: TencentCloudLoadBalancersTag,
    },
    securityGroup: {
      transformer: 'tencentCloudSecurityGroupTransformer',
      reader: 'tencentCloudSecurityGroupReader',
      detailsTemplateUrl: require('./securityGroup/details/securityGroupDetail.html'),
      detailsController: 'tencentCloudSecurityGroupDetailsCtrl',
      createSecurityGroupTemplateUrl: require('./securityGroup/configure/createSecurityGroup.html'),
      createSecurityGroupController: 'tencentCloudCreateSecurityGroupCtrl',
    },
    subnet: {
      renderer: 'tencentCloudSubnetRenderer',
    },
    search: {
      resultFormatter: 'tencentCloudSearchResultFormatter',
    },
  });
});

DeploymentStrategyRegistry.registerProvider('tencentcloud', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);
