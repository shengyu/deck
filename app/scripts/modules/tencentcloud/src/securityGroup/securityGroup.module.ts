import { module } from 'angular';

import { TENCENTCLOUD_SECURITY_GROUP_READER } from './securityGroup.reader';
import { INGRESS_RULE_GROUP_SELECTOR_COMPONENT } from './configure/ingressRuleGroupSelector.component';
import { TENCENTCLOUD_SECURITYGROUP_CLONE_CLONESECURITYGROUP_CONTROLLER } from './clone/cloneSecurityGroup.controller';
import { TENCENTCLOUD_SECURITYGROUP_CONFIGURE_CONFIGSECURITYGROUP_MIXIN_CONTROLLER } from './configure/configSecurityGroup.mixin.controller';
import { TENCENTCLOUD_SECURITYGROUP_CONFIGURE_CREATESECURITYGROUPCTRL } from './configure/CreateSecurityGroupCtrl';
import { TENCENTCLOUD_SECURITYGROUP_CONFIGURE_EDITSECURITYGROUPCTRL } from './configure/EditSecurityGroupCtrl';
import { TENCENTCLOUD_SECURITYGROUP_DETAILS_SECURITYGROUPDETAIL_CONTROLLER } from './details/securityGroupDetail.controller';
import { TENCENTCLOUD_SECURITYGROUP_SECURITYGROUP_TRANSFORMER } from './securityGroup.transformer';

export const TENCENTCLOUD_SECURITY_GROUP_MODULE = 'spinnaker.tencentcloud.securityGroup';
module(TENCENTCLOUD_SECURITY_GROUP_MODULE, [
  TENCENTCLOUD_SECURITY_GROUP_READER,
  TENCENTCLOUD_SECURITYGROUP_CLONE_CLONESECURITYGROUP_CONTROLLER,
  INGRESS_RULE_GROUP_SELECTOR_COMPONENT,
  TENCENTCLOUD_SECURITYGROUP_CONFIGURE_CONFIGSECURITYGROUP_MIXIN_CONTROLLER,
  TENCENTCLOUD_SECURITYGROUP_CONFIGURE_CREATESECURITYGROUPCTRL,
  TENCENTCLOUD_SECURITYGROUP_CONFIGURE_EDITSECURITYGROUPCTRL,
  TENCENTCLOUD_SECURITYGROUP_DETAILS_SECURITYGROUPDETAIL_CONTROLLER,
  TENCENTCLOUD_SECURITYGROUP_SECURITYGROUP_TRANSFORMER,
]);