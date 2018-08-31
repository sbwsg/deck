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

const excludedManifestTypes = [ArtifactTypePatterns.KUBERNETES, ArtifactTypePatterns.DOCKER_IMAGE];

export class KubernetesV2DeployManifestConfigCtrl implements IController {
  public state = {
    loaded: false,
  };

  public metadata: IKubernetesManifestCommandMetadata;
  public textSource = 'text';
  public artifactSource = 'artifact';
  public sources = [this.textSource, this.artifactSource];
  public excludedManifestArtifactPatterns = excludedManifestTypes;

  public expectedArtifacts: IExpectedArtifact[] = [];
  public artifactSources: ManifestArtifactSource[];
  public accountsForManifestType: IArtifactAccount[] = [];
  public supportedManifestKinds = Registry.pipeline
    .getArtifactKinds()
    .filter(a => a.isMatch)
    .filter(a => !excludedManifestTypes.find(t => t.test(a.type)));

  public get manifestExpectedArtifact(): IExpectedArtifact {
    return this.expectedArtifacts.find(ea => ea.id === this.$scope.stage.manifestArtifactId);
  }

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
    if (!manifestArtifactAccount || !this.accountsForManifestType.find(a => a.name === manifestArtifactAccount)) {
      if (this.accountsForManifestType[0]) {
        this.$scope.stage.manifestArtifactAccount = this.accountsForManifestType[0].name;
      } else {
        this.$scope.stage.manifestArtifactAccount = '';
      }
    }
  };

  public onManifestArtifactChange = (expectedArtifact: IExpectedArtifact) => {
    this.$scope.showCreateArtifactForm = false;
    this.$scope.stage.manifestArtifactId = expectedArtifact.id;
    this.updateAccountsForManifestArtifact();
    this.$scope.$apply();
  };

  public onManifestArtifactRequestCreate = () => {
    this.$scope.showCreateArtifactForm = true;
    this.$scope.$apply();
  };

  public onManifestArtifactAccountChange = (account: IArtifactAccount) => {
    this.$scope.stage.manifestArtifactAccount = account ? account.name : '';
    this.$scope.$apply();
  };

  public selectedAccount(): IArtifactAccount {
    const account = this.accountsForManifestType.find(a => a.name === this.$scope.stage.manifestArtifactAccount);
    return account;
  }

  public canShowAccountSelect() {
    return (
      this.$scope.showCreateArtifactForm && this.accountsForManifestType.length > 1 && this.manifestExpectedArtifact
    );
  }

  public onManifestArtifactCreated = (event: {
    expectedArtifact: IExpectedArtifact;
    account: IArtifactAccount;
    source: ManifestArtifactSource;
  }) => {
    this.$scope.stage.manifestArtifactId = event.expectedArtifact.id;
    this.$scope.stage.manifestArtifactAccount = event.account ? event.account.name : '';
    ExpectedArtifactService.addArtifactTo(event.expectedArtifact, event.source.source);
    this.$scope.showCreateArtifactForm = false;
    this.updateExpectedArtifacts();
    this.updateAccountsForManifestArtifact();
    this.$scope.$apply();
  };
}
