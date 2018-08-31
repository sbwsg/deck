import { module } from 'angular';
import * as React from 'react';
import { react2angular } from 'react2angular';
import { TetheredSelect, IExpectedArtifact, IArtifact } from 'core';
import { ArtifactIconService } from './ArtifactIconService';
import { ExpectedArtifactService } from './expectedArtifact.service';
import { EXPECTED_ARTIFACT_KIND_SELECTOR_COMPONENT_REACT } from './ExpectedArtifactKindSelector';
import { EXPECTED_ARTIFACT_SOURCE_SELECTOR_COMPONENT_REACT } from './ExpectedArtifactSourceSelector';
import { ARTIFACT_ACCOUNT_SELECTOR_COMPONENT_REACT } from './ArtifactAccountSelector';

export interface IExpectedArtifactSelectorProps {
  expectedArtifacts: IExpectedArtifact[];
  selected?: IExpectedArtifact;
  requestingNew?: boolean;
  onRequestCreate?: () => void;
  onChange: (_: IExpectedArtifact) => void;
  showIcons?: boolean;
  className?: string;
  offeredArtifactTypes?: RegExp[];
  excludedArtifactTypes?: RegExp[];
}

export interface IExpectedArtifactSelectorState {
  expectedArtifact: IExpectedArtifact;
}

export interface IExpectedArtifactSelectorOption {
  expectedArtifact?: IExpectedArtifact;
  requestingNew: boolean;
}

type IExpectedArtifactFilter = (ea: IExpectedArtifact, a: IArtifact) => boolean;

export class ExpectedArtifactSelector extends React.Component<
  IExpectedArtifactSelectorProps,
  IExpectedArtifactSelectorState
> {
  public static defaultProps = {
    requestingNew: false,
    showIcons: true,
  };

  constructor(props: IExpectedArtifactSelectorProps) {
    super(props);
    this.state = {
      expectedArtifact: props.selected,
    };
  }

  private renderOption = (e: IExpectedArtifactSelectorOption) => {
    if (!e.expectedArtifact && !e.requestingNew) {
      return <span />;
    }
    if (e.requestingNew) {
      return <span>Create new...</span>;
    } else {
      const artifact = ExpectedArtifactService.artifactFromExpected(e.expectedArtifact);
      if (artifact != null) {
        return (
          <span>
            {this.props.showIcons && <img src={ArtifactIconService.getPath(artifact.type)} width="16" height="16" />}
            {artifact.name || artifact.reference}
          </span>
        );
      } else {
        return <span>Error: artifact not found</span>;
      }
    }
  };

  private onChange = (e: IExpectedArtifactSelectorOption) => {
    if (e.requestingNew) {
      this.props.onRequestCreate();
    } else {
      this.props.onChange(e.expectedArtifact);
    }
  };

  private filterExpectedArtifacts(fn: IExpectedArtifactFilter): IExpectedArtifact[] {
    return (this.props.expectedArtifacts || []).filter(ea => {
      const artifact = ExpectedArtifactService.artifactFromExpected(ea);
      if (!artifact) {
        return false;
      }
      return fn(ea, artifact);
    });
  }

  public getExpectedArtifacts(): IExpectedArtifact[] {
    return this.filterExpectedArtifacts((_expectedArtifact, artifact) => {
      const { offeredArtifactTypes, excludedArtifactTypes } = this.props;
      let isIncluded = true;
      let isExcluded = false;
      if (offeredArtifactTypes && offeredArtifactTypes.length > 0) {
        isIncluded = !!offeredArtifactTypes.find(patt => patt.test(artifact.type));
      }
      if (excludedArtifactTypes && excludedArtifactTypes.length > 0) {
        isExcluded = !!excludedArtifactTypes.find(patt => patt.test(artifact.type));
      }
      return isIncluded && !isExcluded;
    });
  }

  public render() {
    const options = this.getExpectedArtifacts().map(ea => {
      return { expectedArtifact: ea, requestingNew: false };
    });
    if (this.props.onRequestCreate) {
      options.push({ expectedArtifact: null, requestingNew: true });
    }
    const value = { expectedArtifact: this.props.selected, requestingNew: this.props.requestingNew };
    return (
      <TetheredSelect
        className={this.props.className || ''}
        options={options}
        optionRenderer={this.renderOption}
        value={value}
        valueRenderer={this.renderOption}
        onChange={this.onChange}
        clearable={false}
      />
    );
  }
}

export const EXPECTED_ARTIFACT_SELECTOR_COMPONENT_REACT = 'spinnaker.core.artifacts.expected.selector.react';
module(EXPECTED_ARTIFACT_SELECTOR_COMPONENT_REACT, [
  EXPECTED_ARTIFACT_KIND_SELECTOR_COMPONENT_REACT,
  EXPECTED_ARTIFACT_SOURCE_SELECTOR_COMPONENT_REACT,
  ARTIFACT_ACCOUNT_SELECTOR_COMPONENT_REACT,
]).component(
  'expectedArtifactSelectorReact',
  react2angular(ExpectedArtifactSelector, [
    'expectedArtifacts',
    'selected',
    'requestingNew',
    'onRequestCreate',
    'onChange',
    'showIcons',
    'className',
    'offeredArtifactTypes',
    'excludedArtifactTypes',
  ]),
);
