import * as React from 'react';
import { BindAll } from 'lodash-decorators';

import { Overridable } from 'core/overrideRegistry';
import { Application } from 'core/application/application.model';
import { DefaultClusterPodTitle } from './DefaultClusterPodTitle';
import { IClusterSubgroup } from './filter/clusterFilter.service';

export { DefaultClusterPodTitle } from './DefaultClusterPodTitle';

export interface IClusterPodTitleProps {
  grouping: IClusterSubgroup;
  application: Application;
  parentHeading: string;
  accountId: string;
}

@BindAll()
@Overridable('clusterPodTitle')
export class ClusterPodTitleWrapper extends React.Component<IClusterPodTitleProps> {
  public render(): React.ReactElement<ClusterPodTitleWrapper> {
    return <DefaultClusterPodTitle {...this.props} />;
  }
}
