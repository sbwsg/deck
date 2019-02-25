import * as React from 'react';
import Select from 'react-select';

import { IArtifact, IExpectedArtifact, IPipeline, IStage } from 'core/domain';
import { ArtifactIcon, ExpectedArtifactService } from 'core/artifact';
import { AccountService, IArtifactAccount } from 'core/account';
import { ArtifactEditor } from './ArtifactEditor';

export interface IStageArtifactSelectorProps {
  pipeline: IPipeline;
  stage: IStage;

  // one of these two will be defined by this selector
  expectedArtifactId?: string;
  artifact?: IArtifact;

  onExpectedArtifactSelected: (expectedArtifact: IExpectedArtifact) => void;
  onArtifactEdited: (artifact: IArtifact) => void;
}

export interface IStageArtifactSelectorState {
  artifactAccounts: IArtifactAccount[];
}

const DEFINE_NEW_ARTIFACT = '__inline.artifact__';

export class StageArtifactSelector extends React.Component<IStageArtifactSelectorProps, IStageArtifactSelectorState> {
  private defineNewArtifactOption: IExpectedArtifact = {
    ...ExpectedArtifactService.createEmptyArtifact(),
    displayName: 'Define a new artifact...',
    id: DEFINE_NEW_ARTIFACT,
  };

  constructor(props: IStageArtifactSelectorProps) {
    super(props);

    this.state = {
      artifactAccounts: [],
    };
  }

  public componentDidMount(): void {
    AccountService.getArtifactAccounts().then(artifactAccounts => {
      this.setState({
        artifactAccounts: artifactAccounts,
      });
    });
  }

  private renderArtifact = (value: IExpectedArtifact) => {
    return (
      <span>
        {value.id !== DEFINE_NEW_ARTIFACT && (
          <ArtifactIcon type={value.defaultArtifact && value.defaultArtifact.type} width="16" height="16" />
        )}
        {value && value.displayName}
      </span>
    );
  };

  private onExpectedArtifactSelected = (value: IExpectedArtifact) => {
    if (value.id !== DEFINE_NEW_ARTIFACT) {
      this.props.onExpectedArtifactSelected(value);
    } else {
      this.props.onArtifactEdited(value.defaultArtifact);
    }
  };

  private onInlineArtifactChanged = (value: IArtifact) => {
    this.props.onArtifactEdited(value);
  };

  public render() {
    const { pipeline, stage, expectedArtifactId, artifact } = this.props;
    const expectedArtifacts = ExpectedArtifactService.getExpectedArtifactsAvailableToStage(stage, pipeline);
    const expectedArtifact = expectedArtifactId
      ? expectedArtifacts.find(a => a.id === expectedArtifactId)
      : artifact
      ? {
          id: DEFINE_NEW_ARTIFACT,
          displayName: 'Artifact from execution context',
          defaultArtifact: artifact,
        }
      : undefined;

    const options = [this.defineNewArtifactOption, ...expectedArtifacts];

    return (
      <>
        <div className="sp-margin-m-bottom">
          <Select
            clearable={false}
            options={options}
            value={expectedArtifact}
            optionRenderer={this.renderArtifact}
            valueRenderer={this.renderArtifact}
            onChange={this.onExpectedArtifactSelected}
            placeholder="Select an artifact..."
          />
        </div>
        {artifact && (
          <ArtifactEditor
            pipeline={pipeline}
            artifact={artifact}
            artifactAccounts={this.state.artifactAccounts}
            onArtifactEdit={(edited: IArtifact) => this.onInlineArtifactChanged(edited)}
            isDefault={true}
          />
        )}
      </>
    );
  }
}