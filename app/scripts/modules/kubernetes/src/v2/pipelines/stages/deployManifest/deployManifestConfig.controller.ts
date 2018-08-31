import { IController, IScope } from 'angular';
import { get } from 'lodash';

import {
  IKubernetesManifestCommandMetadata,
  IKubernetesManifestCommandData,
  KubernetesManifestCommandBuilder,
} from 'kubernetes/v2/manifest/manifestCommandBuilder.service';

import {
  Registry,
  IArtifactAccount,
  IArtifactSource,
  ExpectedArtifactService,
  IExpectedArtifact,
  ArtifactTypePatterns,
  IStage,
  IPipeline,
} from '@spinnaker/core';

type ManifestArtifactSource = IArtifactSource<IStage | IPipeline>;

export class KubernetesV2DeployManifestConfigCtrl implements IController {
  public state = {
    loaded: false,
  };

  public metadata: IKubernetesManifestCommandMetadata;
  public textSource = 'text';
  public artifactSource = 'artifact';
  public sources = [this.textSource, this.artifactSource];
  public excludedManifestArtifactPatterns = [ArtifactTypePatterns.KUBERNETES, ArtifactTypePatterns.DOCKER_IMAGE];

  public expectedArtifacts: IExpectedArtifact[] = [];
  public manifestExpectedArtifact?: IExpectedArtifact;
  public artifactSources: ManifestArtifactSource[];
  public accountsForManifestType: IArtifactAccount[] = [];
  public supportedManifestKinds = Registry.pipeline.getArtifactKinds().filter(a => a.isMatch);

  constructor(private $scope: IScope) {
    'ngInject';
    KubernetesManifestCommandBuilder.buildNewManifestCommand(
      this.$scope.application,
      this.$scope.stage.manifests || this.$scope.stage.manifest,
      this.$scope.stage.moniker,
    ).then((builtCommand: IKubernetesManifestCommandData) => {
      if (this.$scope.stage.isNew) {
        Object.assign(this.$scope.stage, builtCommand.command);
        this.$scope.stage.source = this.textSource;
      }

      if (!this.$scope.stage.manifestArtifactAccount) {
        this.$scope.stage.manifestArtifactAccount = '';
      }

      this.metadata = builtCommand.metadata;
      this.state.loaded = true;
    });

    this.updateExpectedArtifacts();

    if (this.$scope.stage.source === this.artifactSource) {
      if (this.$scope.stage.manifestArtifactId) {
        this.manifestExpectedArtifact = this.expectedArtifacts.find(
          ea => ea.id === this.$scope.stage.manifestArtifactId,
        );
      }
    }

    this.artifactSources = ExpectedArtifactService.sourcesForPipelineStage($scope.$parent.pipeline, $scope.stage);
    this.updateAccountsForManifestArtifact();
  }

  private updateExpectedArtifacts = () => {
    this.expectedArtifacts = ExpectedArtifactService.getExpectedArtifactsAvailableToStage(
      this.$scope.stage,
      this.$scope.$parent.pipeline,
    );
  };

  public updateAccountsForManifestArtifact = () => {
    const artifact = ExpectedArtifactService.artifactFromExpected(this.manifestExpectedArtifact);
    const allAccounts = get(this, ['metadata', 'backingData', 'artifactAccounts'], []);
    this.accountsForManifestType = allAccounts.filter(a => a.types.includes(artifact.type));
    const { manifestArtifactAccount } = this.$scope.stage;
    if (manifestArtifactAccount) {
      if (!this.accountsForManifestType.find(a => a.name === manifestArtifactAccount)) {
        if (this.accountsForManifestType[0]) {
          this.$scope.stage.manifestArtifactAccount = this.accountsForManifestType[0].name;
        } else {
          this.$scope.stage.manifestArtifactAccount = '';
        }
      }
    }
  };

  public onManifestArtifactChange = (expectedArtifact: IExpectedArtifact) => {
    this.$scope.showCreateArtifactForm = false;
    this.manifestExpectedArtifact = expectedArtifact;
    this.$scope.stage.manifestArtifactId = expectedArtifact.id;
    this.updateAccountsForManifestArtifact();
    this.$scope.$apply();
  };

  public onManifestArtifactRequestCreate = () => {
    this.$scope.showCreateArtifactForm = true;
    this.$scope.$apply();
  };

  public onManifestArtifactCreated = (event: {
    expectedArtifact: IExpectedArtifact;
    account: IArtifactAccount;
    source: ManifestArtifactSource;
  }) => {
    this.manifestExpectedArtifact = event.expectedArtifact;
    this.$scope.stage.manifestArtifactId = event.expectedArtifact.id;
    this.$scope.stage.manifestArtifactAccount = event.account.name;
    ExpectedArtifactService.addArtifactTo(event.expectedArtifact, event.source.source);
    this.$scope.showCreateArtifactForm = false;
    this.updateExpectedArtifacts();
    this.$scope.$apply();
  };
}
