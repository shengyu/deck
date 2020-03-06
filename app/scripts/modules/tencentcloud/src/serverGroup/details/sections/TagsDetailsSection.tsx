import * as React from 'react';

import { CollapsibleSection } from '@spinnaker/core';

import { ITencentCloudServerGroupDetailsSectionProps } from './ITencentCloudServerGroupDetailsSectionProps';

export class TagsDetailsSection extends React.Component<ITencentCloudServerGroupDetailsSectionProps> {
  public render(): JSX.Element {
    const { serverGroup } = this.props;

    return (
      <CollapsibleSection heading="Tags">
        {serverGroup.launchConfig.instanceTags.length === 0 && <div>No tags associated with this server group</div>}
        {serverGroup.launchConfig.instanceTags.length > 0 && (
          <dl>
            {serverGroup.launchConfig.instanceTags.map((tag: { key: string; value: string }) => [
              <dt key={tag.key}>{tag.key}</dt>,
              <dd key={tag.value}>{tag.value}</dd>,
            ])}
          </dl>
        )}
      </CollapsibleSection>
    );
  }
}
