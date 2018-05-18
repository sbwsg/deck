import { IScope, module } from 'angular';

import { Application, IManifest, ManifestReader } from '@spinnaker/core';

export interface IManifestContainer {
  manifest: IManifest;
}

export interface IManifestParams {
  account: string;
  location: string;
  name: string;
}

export class KubernetesManifestService {
  public makeManifestRefresher(
    app: Application,
    $scope: IScope,
    params: IManifestParams,
    container: IManifestContainer,
  ) {
    this.updateManifest(params, container);
    app.onRefresh($scope, () => this.updateManifest(params, container));
  }

  private updateManifest(params: IManifestParams, container: IManifestContainer) {
    ManifestReader.getManifest(params.account, params.location, params.name).then(
      (manifest: IManifest) => (container.manifest = manifest || container.manifest),
    );
  }
}

export const KUBERNETES_MANIFEST_SERVICE = 'spinnaker.kubernetes.v2.kubernetes.manifest.service';

module(KUBERNETES_MANIFEST_SERVICE, []).service('kubernetesManifestService', KubernetesManifestService);
