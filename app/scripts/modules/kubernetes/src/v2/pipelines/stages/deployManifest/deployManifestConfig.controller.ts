import { IController, IScope } from 'angular';
import { get, set } from 'lodash';
import { loadAll } from 'js-yaml';

import {
  IKubernetesManifestCommandMetadata,
  IKubernetesManifestCommandData,
  KubernetesManifestCommandBuilder,
} from '../../../manifest/manifestCommandBuilder.service';

import { ExpectedArtifactService, IExpectedArtifact, ArtifactTypePatterns, IArtifactAccount } from '@spinnaker/core';

export class KubernetesV2DeployManifestConfigCtrl implements IController {
  public state = {
    loaded: false,
  };

  public metadata: IKubernetesManifestCommandMetadata;
  public textSource = 'text';
  public artifactSource = 'artifact';
  public sources = [this.textSource, this.artifactSource];
  public excludedManifestArtifactPatterns = [ArtifactTypePatterns.KUBERNETES, ArtifactTypePatterns.DOCKER_IMAGE];

  public expectedArtifacts: IExpectedArtifact[];
  public onChangeManifestArtifact: (e: IExpectedArtifact, a: IArtifactAccount) => void;

  constructor(private $scope: IScope) {
    'ngInject';
    KubernetesManifestCommandBuilder.buildNewManifestCommand(
      this.$scope.application,
      this.$scope.stage.manifests || this.$scope.stage.manifest,
      this.$scope.stage.moniker,
    ).then((builtCommand: IKubernetesManifestCommandData) => {
      if (this.$scope.stage.isNew) {
        Object.assign(this.$scope.stage, builtCommand.command);
      }
      if (!this.$scope.stage.source) {
        this.$scope.stage.source = this.textSource;
      }

      if (!this.$scope.stage.manifestArtifactAccount) {
        this.$scope.stage.manifestArtifactAccount = '';
      }

      this.metadata = builtCommand.metadata;
      this.state.loaded = true;
    });

    this.updateExpectedArtifacts();

    this.onChangeManifestArtifact = (expectedArtifact: IExpectedArtifact, account: IArtifactAccount) => {
      const pipelineArtifacts = this.$scope.$parent.pipeline.expectedArtifacts.slice();
      if (expectedArtifact) {
        const index = (pipelineArtifacts || []).findIndex((a: IExpectedArtifact) => a.id === expectedArtifact.id);
        if (index > -1) {
          pipelineArtifacts[index] = expectedArtifact;
          this.$scope.$parent.pipeline.expectedArtifacts = pipelineArtifacts;
          this.updateExpectedArtifacts();
        }
        this.$scope.stage.manifestArtifactId = expectedArtifact.id;
      } else {
        this.$scope.stage.manifestArtifactId = '';
      }
      if (account) {
        this.$scope.stage.manifestArtifactAccount = account.name;
      } else {
        this.$scope.stage.manifestArtifactAccount = '';
      }
      this.$scope.$apply();
    };
  }

  public change() {
    this.$scope.ctrl.metadata.yamlError = false;
    try {
      this.$scope.stage.manifests = [];
      loadAll(this.metadata.manifestText, doc => {
        if (Array.isArray(doc)) {
          doc.forEach(d => this.$scope.stage.manifests.push(d));
        } else {
          this.$scope.stage.manifests.push(doc);
        }
      });
    } catch (e) {
      this.$scope.ctrl.metadata.yamlError = true;
    }
  }

  public getManifestArtifact() {
    const artifactId = get(this, ['$scope', 'stage', 'manifestArtifactId'], null);
    let artifact: IExpectedArtifact;
    let createNew = false;
    if (artifactId) {
      artifact = this.expectedArtifacts.find(ea => ea.id === artifactId);
      if (!artifact) {
        createNew = true;
      }
    } else {
      createNew = true;
    }
    if (createNew) {
      artifact = ExpectedArtifactService.addNewArtifactTo(this.$scope.$parent.pipeline);
      this.updateExpectedArtifacts();
      this.$scope.stage.manifestArtifactId = artifact.id;
    }
    return artifact;
  }

  public updateExpectedArtifacts() {
    this.expectedArtifacts = ExpectedArtifactService.getExpectedArtifactsAvailableToStage(
      this.$scope.stage,
      this.$scope.$parent.pipeline,
    );
  }
}
