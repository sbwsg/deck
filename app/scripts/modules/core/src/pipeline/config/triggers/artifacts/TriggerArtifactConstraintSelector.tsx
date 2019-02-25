import './triggerArtifactConstraintSelector.less';

import { module } from 'angular';
import * as React from 'react';
import Select from 'react-select';
import { react2angular } from 'react2angular';

import { IExpectedArtifact, IPipeline } from 'core/domain';
import { ExpectedArtifactModal, ExpectedArtifactService } from 'core/artifact';

export interface ITriggerArtifactConstraintSelectorProps {
  pipeline: IPipeline;
  artifactReferer: any; // the object referring to a set of expected artifacts
  selected: string[]; // expected artifact ids
  onDefineExpectedArtifact: (artifact: IExpectedArtifact) => void;
  onChangeSelected: (selected: string[], referer: any) => void;
}

export class TriggerArtifactConstraintSelector extends React.Component<ITriggerArtifactConstraintSelectorProps> {
  private handleChange = (index: number, selectedArtifact: IExpectedArtifact) => {
    if (selectedArtifact.id === '__create.new.artifact') {
      ExpectedArtifactModal.show({ pipeline: this.props.pipeline }).then(this.props.onDefineExpectedArtifact);
      return;
    }

    const selected = this.props.selected.slice(0);
    selected[index] = selectedArtifact.id;
    this.props.onChangeSelected(selected, this.props.artifactReferer);
  };

  private removeExpectedArtifact = (artifact: IExpectedArtifact) => {
    const selected = this.props.selected.slice(0);
    selected.splice(selected.findIndex(artifactId => artifact.id === artifactId), 1);
    this.props.onChangeSelected(selected, this.props.artifactReferer);
  };

  private editExpectedArtifact = (artifact: IExpectedArtifact) => {
    ExpectedArtifactModal.show({
      expectedArtifact: artifact,
      pipeline: this.props.pipeline,
    }).then((editedArtifact: IExpectedArtifact) => {
      this.props.onDefineExpectedArtifact(editedArtifact);
      this.props.onChangeSelected(this.props.selected, this.props.artifactReferer);
    });
  };

  private renderArtifact = (artifact: IExpectedArtifact) => {
    return <span>{artifact && artifact.displayName}</span>;
  };

  public render() {
    const { pipeline, selected } = this.props;
    const selectedAsArtifacts = pipeline.expectedArtifacts.filter(artifact => selected.includes(artifact.id));
    const availableArtifacts = pipeline.expectedArtifacts.filter(artifact => !selected.includes(artifact.id));

    const createNewArtifact = ExpectedArtifactService.createEmptyArtifact();
    createNewArtifact.id = '__create.new.artifact';
    createNewArtifact.displayName = 'Define a new artifact...';
    availableArtifacts.push(createNewArtifact);

    const renderSelect = (artifact: IExpectedArtifact, i: number, editable: boolean) => (
      <div>
        <div className="col-md-10" key={(artifact && artifact.id) || 'new'}>
          <div className="artifact-select input-sm">
            <Select
              clearable={false}
              value={artifact}
              onChange={(a: IExpectedArtifact) => this.handleChange(i, a)}
              options={availableArtifacts}
              optionRenderer={this.renderArtifact}
              valueRenderer={this.renderArtifact}
              placeholder="Select or define an artifact..."
            />
          </div>
        </div>
        {editable && (
          <div className="col-md-2">
            <a className="glyphicon glyphicon-edit" onClick={() => this.editExpectedArtifact(artifact)} />
            <a className="glyphicon glyphicon-trash" onClick={() => this.removeExpectedArtifact(artifact)} />
          </div>
        )}
      </div>
    );
    const renderSelectEditable = (artifact: IExpectedArtifact, i: number) => renderSelect(artifact, i, true);

    return (
      <>
        {selectedAsArtifacts.map(renderSelectEditable)}
        {renderSelect(undefined, selected.length, false)}
      </>
    );
  }
}

export const TRIGGER_ARTIFACT_CONSTRAINT_SELECTOR_REACT = 'spinnaker.core.trigger.artifact.selector.react';
module(TRIGGER_ARTIFACT_CONSTRAINT_SELECTOR_REACT, []).component(
  'triggerArtifactConstraintSelectorReact',
  react2angular(TriggerArtifactConstraintSelector, [
    'pipeline',
    'artifactReferer',
    'selected',
    'onDefineExpectedArtifact',
    'onChangeSelected',
  ]),
);