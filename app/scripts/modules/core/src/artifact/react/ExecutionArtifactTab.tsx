import * as React from 'react';
import { get, has } from 'lodash';
import {
  IExpectedArtifact,
  IExecution,
  IExecutionDetailsSectionProps,
  ExecutionDetailsSection,
  AccountService,
} from 'core';
import { ArtifactIconList } from './ArtifactIconList';

import '../artifactTab.less';
import { Registry } from 'core/registry';

export class ExecutionArtifactTab extends React.Component<IExecutionDetailsSectionProps> {
  public static title = 'artifactStatus';

  private extractBoundArtifactsFromExecution(execution: IExecution): IExpectedArtifact[] {
    const triggerArtifacts = get(execution, ['trigger', 'resolvedExpectedArtifacts'], []);
    const stageOutputArtifacts = get(execution, 'stages', []).reduce((out, stage) => {
      const outputArtifacts = get(stage, ['outputs', 'resolvedExpectedArtifacts'], []);
      return out.concat(outputArtifacts);
    }, []);
    const allArtifacts = triggerArtifacts.concat(stageOutputArtifacts);
    return allArtifacts.filter(a => has(a, 'boundArtifact'));
  }

  private artifactLists() {
    const { stage, execution } = this.props;
    const stageConfig = Registry.pipeline.getStageConfig(stage);
    const stageContext = get(stage, ['context'], {});

    console.log('artifactLists', { stageConfig });

    const consumedIds = new Set(
      stageConfig && stageConfig.artifactExtractor ? stageConfig.artifactExtractor(stageContext) : [],
    );

    console.log('extractedArtifact', stageConfig.artifactExtractor(stageContext));

    const boundArtifacts = this.extractBoundArtifactsFromExecution(execution);
    console.log('boundArtifacts', boundArtifacts);

    const consumedArtifacts = boundArtifacts
      .filter(rea => consumedIds.has(rea.id))
      .map(rea => rea.boundArtifact)
      .filter(({ name, type }) => name && type);

    const producedArtifacts = get(stage, ['outputs', 'artifacts'], []).slice();

    console.log('consumedArtifacts', consumedArtifacts);

    return { consumedArtifacts, producedArtifacts };
  }

  private onArtifactClicked = (artifact: IArtifact) => {
    const requestArtifact = { ...artifact };
    console.log('onArtifactClicked', this.props.stage, this.props.execution, requestArtifact);
    // API.one('artifacts', 'fetch').data(artifact)
  };

  public render() {
    const { consumedArtifacts, producedArtifacts } = this.artifactLists();
    return (
      <ExecutionDetailsSection name={this.props.name} current={this.props.current}>
        <div className="row execution-artifacts">
          <div className="col-sm-6 artifact-list-container">
            <h5>Consumed Artifacts</h5>
            <div>
              <ArtifactIconList artifacts={consumedArtifacts} onClick={this.onArtifactClicked} />
            </div>
          </div>
          <div className="col-sm-6 artifact-list-container">
            <h5>Produced Artifacts</h5>
            <div>
              <ArtifactIconList artifacts={producedArtifacts} />
            </div>
          </div>
        </div>
      </ExecutionDetailsSection>
    );
  }
}
