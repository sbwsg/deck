import * as React from 'react';
import { get } from 'lodash';
import { BindAll } from 'lodash-decorators';

import { Application } from 'core/application/application.model';
import { ReactInjector } from 'core/reactShims';
import { DefaultClusterPodTitle } from './DefaultClusterPodTitle';
import { IClusterSubgroup } from './filter/clusterFilter.service';

export interface IClusterPodTitleProps {
  grouping: IClusterSubgroup;
  application: Application;
  parentHeading: string;
}

export interface IClusterPodTitleState {
  overrideTitle?: React.Component
}

@BindAll()
export class ClusterPodTitleWrapper extends React.Component<IClusterPodTitleProps, IClusterPodTitleState> {
  constructor() {
    super();
    this.state = {};
  }

  public render(): React.ReactElement<ClusterPodTitleWrapper> {
    const { overrideRegistry, cloudProviderRegistry, accountService } = ReactInjector;
    console.log({
      grouping: this.props.grouping,
      app: this.props.application,
      cloudProviderRegistry,
      accountService,
    });
    const accountId = get(this.props.grouping, 'cluster.account');
    if (this.state.overrideTitle == null) {
      accountService.getAccountDetails(accountId).then(account => {
        const overrideTitle = cloudProviderRegistry.getValue(
          account.cloudProvider,
          'clusterPodTitle',
          account.providerVersion
        );
        if (overrideTitle) {
          this.setState({ overrideTitle });
        }
      });
    }

    const config = overrideRegistry.getComponent('clusterPodTitle');
    console.log({ config });
    const Title = this.state.overrideTitle || config || DefaultClusterPodTitle;

    return <Title {...this.props} />;
  }
}
