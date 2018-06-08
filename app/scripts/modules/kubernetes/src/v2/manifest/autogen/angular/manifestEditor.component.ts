import { module, IController, IComponentOptions } from 'angular';
import { KUBERNETES_MANIFEST_EDITOR_SWITCH } from './manifestEditorSwitch.component';
import { KUBERNETES_MANIFEST_EDITOR_ARRAY } from './manifestEditorArray.component';
import { KUBERNETES_MANIFEST_EDITOR_LABEL } from './manifestEditorLabel.component';

import './manifestEditor.less';

const spec = require('kubernetes/v2/manifest/autogen/v1.12.0.json');

class KubernetesManifestEditorCtrl implements IController {
  public definitions: any = spec;
  public definitionKey = 'io.k8s.api.apps.v1.Deployment';
  public definition: any;

  public $onInit() {
    this.definition = this.definitions[this.definitionKey];
  }
}

class KubernetesManifestEditorComponent implements IComponentOptions {
  public controller: any = KubernetesManifestEditorCtrl;
  public controllerAs = 'ctrl';
  public template = `
    <ng-form name="manifest" class="kubernetes-manifest-editor">
      <div ng-repeat="child in ctrl.definition.children">
        <kubernetes-manifest-editor-switch definitions="ctrl.definitions" definition="child" />
      </div>
    </ng-form>
  `;
}

export const KUBERNETES_MANIFEST_EDITOR = 'spinnaker.kubernetes.v2.kubernetes.manifest.editor.component';
// const KUBERNETES_MANIFEST_EDITOR_OBJECT = 'spinnaker.kubernetes.v2.kubernetes.manifest.editor.object.component';

module(KUBERNETES_MANIFEST_EDITOR, [
  KUBERNETES_MANIFEST_EDITOR_SWITCH,
  KUBERNETES_MANIFEST_EDITOR_ARRAY,
  KUBERNETES_MANIFEST_EDITOR_LABEL,
]).component('kubernetesManifestEditor', new KubernetesManifestEditorComponent());
