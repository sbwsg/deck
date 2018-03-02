import * as React from 'react';
import { get, startCase } from 'lodash';
import { BindAll } from 'lodash-decorators';
import { Overrides } from 'core/overrideRegistry';

import { AccountTag } from 'core/account';
import { EntityNotifications } from 'core/entityTag/notifications/EntityNotifications';
import { HealthCounts } from 'core/healthCounts';
import { IClusterPodTitleProps } from 'core/cluster/ClusterPodTitleWrapper';


@BindAll()
@Overrides('clusterPodTitle', 'kubernetes', 'v2')
export class ClusterPodTitle extends React.Component<IClusterPodTitleProps> {

  public render(): React.ReactElement<ClusterPodTitle> {
    const { grouping, application, parentHeading } = this.props;

    const sgm = this.extractServerGroupManager();
    if (sgm) {
      console.log({ sgm });
    }

    let title = ` ${grouping.heading}`;
    if (sgm) {
      title = ` ${startCase(sgm.kind)} ${grouping.heading}`;
    }

    return (
      <div className="rollup-title-cell">
        <div className="heading-tag">
          <AccountTag account={parentHeading} />
        </div>

        <div className="pod-center horizontal space-between center flex-1">
          <div>
            <span className="glyphicon glyphicon-th"/>
            { title }
          </div>

          <EntityNotifications
            entity={grouping}
            application={application}
            placement="top"
            hOffsetPercent="90%"
            entityType="cluster"
            pageLocation="pod"
            className="inverse"
            onUpdate={() => application.serverGroups.refresh()}
          />
        </div>

        <HealthCounts container={grouping.cluster.instanceCounts}/>

      </div>
    )
  }

  private extractServerGroupManager(): IServerGroupManager {
    const { application, grouping } = this.props;
    const subgroups = get(grouping, 'subgroups', []);
    if (subgroups.length === 0) {
      return null;
    }
    const serverGroupSubGroups = subgroups.filter(sg => sg.category === 'serverGroup');
    const serverGroups = serverGroupSubGroups.reduce((memo, sg) => {
      if (sg.serverGroups && sg.serverGroups.length > 0) {
        memo = memo.concat(sg.serverGroups);
      }
      return memo;
    }, []);

    console.log({ serverGroups });

    return application.getDataSource('serverGroupManagers').data.find((manager: IServerGroupManager) =>
      manager.serverGroups.some(group =>
        !!serverGroups.find(sg => {
          return sg.name === group.name
            && sg.region === manager.region
            && sg.account === manager.account;
        });
      )
    );
  }
}
