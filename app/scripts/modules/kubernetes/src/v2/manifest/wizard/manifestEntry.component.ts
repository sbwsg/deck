import { IComponentOptions, IController, module } from 'angular';
import { IKubernetesManifestCommand, IKubernetesManifestCommandMetadata } from '../manifestCommandBuilder.service';
import { KUBERNETES_MANIFEST_EDITOR } from 'kubernetes/v2/manifest/autogen/angular/manifestEditor.component';

import './manifestEntry.less';

class KubernetesManifestCtrl implements IController {
  public command: IKubernetesManifestCommand;
  public metadata: IKubernetesManifestCommandMetadata;
  public formView = false;
  public change: () => void;
  public toggleView() {
    this.formView = !this.formView;
  }
}

class KubernetesManifestEntryComponent implements IComponentOptions {
  public bindings: any = { command: '=', metadata: '=', change: '&' };
  public controller: any = KubernetesManifestCtrl;
  public controllerAs = 'ctrl';
  public template = `
      <ng-form name="manifest">
        <button ng-click="ctrl.toggleView()">Toggle View</button>

        <div ng-if="!ctrl.formView" class="kubernetes-manifest-entry-container form-group" ng-class="{ 'kubernetes-manifest-error': ctrl.metadata.yamlError }">
          <div style="" class="kubernetes-manifest-yaml-error-message">Invalid YAML</div>
          <textarea class="code form-control kubernetes-manifest-entry" ng-model="ctrl.metadata.manifestText" ng-change="ctrl.change()" rows="40"></textarea>
        </div>

        <div ng-if="ctrl.formView">
          <kubernetes-manifest-editor />
        </div>
      </ng-form>
  `;
}

export const KUBERNETES_MANIFEST_ENTRY = 'spinnaker.kubernetes.v2.kubernetes.manifest.entry.component';
module(KUBERNETES_MANIFEST_ENTRY, [KUBERNETES_MANIFEST_EDITOR]).component(
  'kubernetesManifestEntry',
  new KubernetesManifestEntryComponent(),
);
