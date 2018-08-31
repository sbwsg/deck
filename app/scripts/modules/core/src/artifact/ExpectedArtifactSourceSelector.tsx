import { module } from 'angular';
import * as React from 'react';
import { react2angular } from 'react2angular';
import { TetheredSelect, IExpectedArtifact } from 'core';

export interface IExpectedArtifactSourceOption {
  source: {
    expectedArtifacts: IExpectedArtifact[];
    name: string;
  };
  label: string;
}

export interface IExpectedArtifactSourceSelectorProps {
  sources: IExpectedArtifactSourceOption[];
  selected: IExpectedArtifactSourceOption;
  onChange: (_: IExpectedArtifactSourceOption) => void;
  className?: string;
}

export class ExpectedArtifactSourceSelector extends React.Component<IExpectedArtifactSourceSelectorProps> {
  constructor(props: IExpectedArtifactSourceSelectorProps) {
    super(props);
  }

  private renderOption = (option: IExpectedArtifactSourceOption) => {
    return <span>{option.label}</span>;
  };

  private onChange = (option: IExpectedArtifactSourceOption) => {
    this.props.onChange(option);
  };

  public render() {
    return (
      <TetheredSelect
        className={this.props.className || ''}
        options={this.props.sources}
        optionRenderer={this.renderOption}
        value={this.props.selected}
        valueRenderer={this.renderOption}
        onChange={this.onChange}
        clearable={false}
      />
    );
  }
}

export const EXPECTED_ARTIFACT_SOURCE_SELECTOR_COMPONENT_REACT =
  'spinnaker.core.artifacts.expected.source.selector.react';
module(EXPECTED_ARTIFACT_SOURCE_SELECTOR_COMPONENT_REACT, []).component(
  'expectedArtifactSourceSelectorReact',
  react2angular(ExpectedArtifactSourceSelector, ['sources', 'className', 'onChange', 'selected']),
);
