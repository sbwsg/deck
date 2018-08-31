import { module } from 'angular';
import * as React from 'react';
import { react2angular } from 'react2angular';
import { IArtifactAccount, TetheredSelect } from 'core';

export interface IArtifactAccountSelectorProps {
  accounts: IArtifactAccount[];
  selected: IArtifactAccount;
  onChange: (_: IArtifactAccount) => void;
  className?: string;
}

export class ArtifactAccountSelector extends React.Component<IArtifactAccountSelectorProps> {
  constructor(props: IArtifactAccountSelectorProps) {
    super(props);
  }

  private renderOption = (option: IArtifactAccount) => {
    return <span>{option.name}</span>;
  };

  public render() {
    return (
      <TetheredSelect
        className={this.props.className || ''}
        options={this.props.accounts}
        optionRenderer={this.renderOption}
        value={this.props.selected}
        valueRenderer={this.renderOption}
        onChange={this.props.onChange}
        clearable={false}
      />
    );
  }
}

export const ARTIFACT_ACCOUNT_SELECTOR_COMPONENT_REACT = 'spinnaker.core.artifacts.account.selector.react';
module(ARTIFACT_ACCOUNT_SELECTOR_COMPONENT_REACT, []).component(
  'artifactAccountSelectorReact',
  react2angular(ArtifactAccountSelector, ['accounts', 'className', 'onChange', 'selected']),
);
