import * as React from 'react';
import { Dropdown } from 'react-bootstrap';

import {
  Application,
  ApplicationReader,
  ConfirmationModalService,
  LoadBalancerWriter,
  SETTINGS,
  ManagedMenuItem,
  NgReact,
  HelpField,
} from '@spinnaker/core';

import { ITencentCloudLoadBalancer, ITencentCloudLoadBalancerDeleteCommand } from 'tencentcloud/domain';

import { ILoadBalancerFromStateParams } from './loadBalancerDetails.controller';
import { LoadBalancerTypes } from '../configure/LoadBalancerTypes';
import { values } from 'lodash';

export interface ILoadBalancerActionsProps {
  app: Application;
  loadBalancer: ITencentCloudLoadBalancer;
  loadBalancerFromParams: ILoadBalancerFromStateParams;
}

export interface ILoadBalancerActionsState {
  application: Application;
}

export class LoadBalancerActions extends React.Component<ILoadBalancerActionsProps, ILoadBalancerActionsState> {
  constructor(props: ILoadBalancerActionsProps) {
    super(props);

    const { app, loadBalancer } = this.props;

    let application: Application;

    const loadBalancerAppName = loadBalancer.name.split('-')[0];
    if (loadBalancerAppName === app.name) {
      // Name matches the currently active application
      application = app;
    } else {
      // Load balancer is a part of a different application
      ApplicationReader.getApplication(loadBalancerAppName)
        .then(loadBalancerApp => {
          this.setState({ application: loadBalancerApp });
        })
        .catch(() => {
          // If the application can't be found, just use the old one
          this.setState({ application: this.props.app });
        });
    }

    this.state = {
      application,
    };
  }

  public editLoadBalancer = (): void => {
    const { loadBalancer } = this.props;
    const { application } = this.state;
    const LoadBalancerModal = LoadBalancerTypes.find(t => t.type === 'application').component;
    LoadBalancerModal.show({ app: application, loadBalancer });
  };

  public deleteLoadBalancer = (): void => {
    const { app, loadBalancer, loadBalancerFromParams } = this.props;

    if (loadBalancer.instances && loadBalancer.instances.length) {
      return;
    }

    const taskMonitor = {
      application: app,
      title: 'Deleting ' + loadBalancerFromParams.name,
      onTaskComplete: () => this.props.app.loadBalancers.refresh(),
    };

    const command: ITencentCloudLoadBalancerDeleteCommand = {
      application: app.name,
      cloudProvider: loadBalancer.cloudProvider,
      loadBalancerName: loadBalancer.name,
      loadBalancerId: loadBalancer.id,
      region: loadBalancer.region,
      account: loadBalancer.account,
      credentials: loadBalancer.account,
    };

    const submitMethod = () => LoadBalancerWriter.deleteLoadBalancer(command, app);

    ConfirmationModalService.confirm({
      header: `Really delete ${loadBalancerFromParams.name} in ${loadBalancerFromParams.region}: ${loadBalancerFromParams.accountId}?`,
      buttonText: `Delete ${loadBalancerFromParams.name}`,
      account: loadBalancerFromParams.accountId,
      taskMonitorConfig: taskMonitor,
      submitMethod,
    });
  };

  private entityTagUpdate = (): void => {
    this.props.app.loadBalancers.refresh();
  };

  public render() {
    const { app, loadBalancer } = this.props;
    const { application } = this.state;
    const { AddEntityTagLinks } = NgReact;

    const { loadBalancerType, instances, instanceCounts } = loadBalancer;
    const loadBalancerAppName = loadBalancer.name.split('-')[0];

    const clbInstances =
      loadBalancerType === 'classic' && values(instanceCounts).filter((v: number | undefined) => v).length;
    const allowDeletion = !clbInstances && !instances.length;

    return (
      <div style={{ display: 'inline-block' }}>
        <Dropdown className="dropdown" id="load-balancer-actions-dropdown">
          <Dropdown.Toggle className="btn btn-sm btn-primary dropdown-toggle">
            <span>Load Balancer Actions</span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu">
            {application && (
              <ManagedMenuItem resource={loadBalancer} application={app} onClick={this.editLoadBalancer}>
                Edit Load Balancer
              </ManagedMenuItem>
            )}
            {!application && (
              <li className="disabled">
                <a>
                  Edit Load Balancer{' '}
                  <HelpField
                    content={`The application <b>${loadBalancerAppName}</b> must be configured before this load balancer can be edited.`}
                  />
                </a>
              </li>
            )}
            {allowDeletion && (
              <ManagedMenuItem resource={loadBalancer} application={app} onClick={this.deleteLoadBalancer}>
                Delete Load Balancer
              </ManagedMenuItem>
            )}
            {!allowDeletion && (
              <li className="disabled">
                <a>
                  Delete Load Balancer{' '}
                  <HelpField content="You must detach all instances before you can delete this load balancer." />
                </a>
              </li>
            )}
            {SETTINGS && SETTINGS.feature.entityTags && (
              <AddEntityTagLinks
                component={loadBalancer}
                application={app}
                entityType="loadBalancer"
                onUpdate={this.entityTagUpdate}
              />
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}
