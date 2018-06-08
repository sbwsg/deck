import { module, IController, IComponentOptions } from 'angular';
import { KUBERNETES_MANIFEST_EDITOR_NESTED } from './manifestEditorNested.component';

class KubernetesEditorSwitchCtrl implements IController {
  public definitions: any;
  public definition: any;
  public isNotSimple = false;
  public isGrowable = false;
  public hidden = false;

  public $onInit() {
    if (this.definition.readOnly) {
      this.hidden = true;
    }
    if (!['string', 'integer', 'boolean', 'array', 'object'].includes(this.definition.t)) {
      this.isNotSimple = true;
    }
    if (['array', 'object'].includes(this.definition.t)) {
      this.isGrowable = true;
    }
  }
}

class KubernetesManifestEditorSwitchComponent implements IComponentOptions {
  public bindings: any = { definitions: '<', definition: '<' };
  public controller: any = KubernetesEditorSwitchCtrl;
  public controllerAs = 'ctrl';
  public template = `
    <kubernetes-manifest-editor-label ng-if="!ctrl.hidden && !ctrl.isGrowable && !ctrl.isNotSimple" definition="ctrl.definition" definitions="ctrl.definitions" />
    <input ng-if="!ctrl.hidden && ctrl.definition.t == 'string'" type="text" />
    <input ng-if="!ctrl.hidden && ctrl.definition.t == 'integer'" type="number" />
    <input ng-if="!ctrl.hidden && ctrl.definition.t == 'boolean'" type="checked" />
    <kubernetes-manifest-editor-array ng-if="!ctrl.hidden && ctrl.definition.t == 'array'" definition="ctrl.definition" definitions="ctrl.definitions" />
    <kubernetes-manifest-editor-nested ng-if="!ctrl.hidden && !ctrl.isGrowable && ctrl.isNotSimple" definition="ctrl.definition" definitions="ctrl.definitions" />
  `;
}

export const KUBERNETES_MANIFEST_EDITOR_SWITCH = 'spinnaker.kubernetes.v2.kubernetes.manifest.editor.switch.component';

module(KUBERNETES_MANIFEST_EDITOR_SWITCH, [KUBERNETES_MANIFEST_EDITOR_NESTED]).component(
  'kubernetesManifestEditorSwitch',
  new KubernetesManifestEditorSwitchComponent(),
);
