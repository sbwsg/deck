import * as React from 'react';
import { get, cloneDeep, startCase } from 'lodash';

import { Overrides } from '@spinnaker/core';
import { IClusterPodTitleProps, DefaultClusterPodTitle } from '@spinnaker/core';
import { IServerGroupManager } from '@spinnaker/core';
import { IServerGroupSubgroup } from '@spinnaker/core';

@Overrides('clusterPodTitle', 'kubernetes', 'v2')
export class KubernetesV2ClusterPodTitle extends React.Component<IClusterPodTitleProps> {
  private serverGroupManager() {
    const subgroups = get(this.props, 'grouping.subgroups', [] as IServerGroupSubgroup[]);
    const application = this.props.application;
    const dataSource = application.getDataSource('serverGroupManagers');
    const serverGroups = subgroups.reduce((memo, subgroup) => {
      if (subgroup.serverGroups) {
        memo = memo.concat(subgroup.serverGroups);
      }
      return memo;
    }, []);
    return (dataSource.data || []).find((manager: IServerGroupManager) => {
      return manager.serverGroups.some(managedGroup => {
        return !!serverGroups.find(serverGroup => {
          return serverGroup.name === managedGroup.name
            && serverGroup.region === manager.region
            && serverGroup.account === manager.account
        });
      });
    });
  }

  private groupingWithKind() {
    const grouping = cloneDeep(this.props.grouping);
    if (this.props.grouping.category === 'serverGroup') {
      const sgm = this.serverGroupManager();
      const firstServerGroup = get(grouping, 'subgroups.0.serverGroups.0', null);
      if (sgm && sgm.kind) {
        grouping.heading = ` ${startCase(sgm.kind)} ${grouping.heading}`;
      } else if (firstServerGroup) {
        const kind = firstServerGroup.name.split(' ')[0];
        grouping.heading = ` ${startCase(kind)} ${grouping.heading}`;
      }
    }
    return grouping;
  }

  public render(): any {
    return <DefaultClusterPodTitle {...this.props} grouping={this.groupingWithKind()} />;
  }
}
