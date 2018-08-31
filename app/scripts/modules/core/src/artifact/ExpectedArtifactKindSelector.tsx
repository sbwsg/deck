import { module } from 'angular';
import * as React from 'react';
import { react2angular } from 'react2angular';
import { TetheredSelect, IArtifactKindConfig } from 'core';
import { ArtifactIconService } from './ArtifactIconService';

export interface IExpectedArtifactKindSelectorProps {
  kinds: IArtifactKindConfig[];
  selected: IArtifactKindConfig;
  onChange: (ak: IArtifactKindConfig) => void;
  className?: string;
  showIcons?: boolean;
}

export interface IExpectedArtifactKindSelectorState {
  selected?: IArtifactKindConfig;
}

export class ExpectedArtifactKindSelector extends React.Component<
  IExpectedArtifactKindSelectorProps,
  IExpectedArtifactKindSelectorState
> {
  public static defaultProps = {
    showIcons: true,
  };

  constructor(props: IExpectedArtifactKindSelectorProps) {
    super(props);
    this.state = {
      selected: props.selected,
    };
  }

  private renderOption = (o: IArtifactKindConfig) => {
    return (
      <span>
        {this.props.showIcons && <img src={ArtifactIconService.getPath(o.type)} width="16" height="16" />}
        {o.label} - {o.description}
      </span>
    );
  };

  private onChange = (ak: IArtifactKindConfig) => {
    this.setState({ selected: ak });
    this.props.onChange(ak);
  };

  public render() {
    return (
      <TetheredSelect
        className={this.props.className || ''}
        options={this.props.kinds}
        optionRenderer={this.renderOption}
        value={this.state.selected}
        valueRenderer={this.renderOption}
        onChange={this.onChange}
        clearable={false}
      />
    );
  }
}

export const EXPECTED_ARTIFACT_KIND_SELECTOR_COMPONENT_REACT = 'spinnaker.core.artifacts.expected.kind.selector.react';
module(EXPECTED_ARTIFACT_KIND_SELECTOR_COMPONENT_REACT, []).component(
  'expectedArtifactKindSelectorReact',
  react2angular(ExpectedArtifactKindSelector, ['kinds', 'selected', 'onChange', 'showIcons', 'className']),
);
