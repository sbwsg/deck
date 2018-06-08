import { module, IController, IComponentOptions } from 'angular';

class KubernetesManifestEditorArrayCtrl implements IController {
  public definition: any;
  public itemType: any;
  public simpleItemType = false;
  public definitions: any;
  public entries: any[] = [];

  public $onInit() {
    this.itemType = this.definition.item;
    if (['string', 'integer', 'boolean'].includes(this.itemType)) {
      this.simpleItemType = true;
    }
  }

  public onClick() {
    const entries = this.entries.slice();
    entries.push({ t: this.itemType, key: ' ' });
    this.entries = entries;
  }
}

class KubernetesManifestEditorArrayComponent implements IComponentOptions {
  public bindings: any = { definition: '<', definitions: '<' };
  public controller: any = KubernetesManifestEditorArrayCtrl;
  public controllerAs = 'ctrl';
  public template = `
  <kubernetes-manifest-editor-label definition="ctrl.definition" />
  <button ng-click="ctrl.onClick()">+ Add</button>
  <div>
    <div class="array-entry" ng-repeat="entry in ctrl.entries">
      <kubernetes-manifest-editor-switch definition="entry" definitions="ctrl.definitions" />
    </div>
  </div>
  `;
}

export const KUBERNETES_MANIFEST_EDITOR_ARRAY = 'spinnaker.kubernetes.v2.kubernetes.manifest.editor.array.component';

module(KUBERNETES_MANIFEST_EDITOR_ARRAY, []).component(
  'kubernetesManifestEditorArray',
  new KubernetesManifestEditorArrayComponent(),
);
