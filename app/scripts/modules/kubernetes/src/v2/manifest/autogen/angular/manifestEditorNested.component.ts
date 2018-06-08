import { module, IController, IComponentOptions } from 'angular';

class KubernetesEditorNestedCtrl implements IController {
  public definitions: any;
  public definition: any;
  public isSimpleSingleton = false;
  public isComplexNested = false;
  public isJustChildren = false;
  public nextDefinition: any;

  public $onInit() {
    if (this.definition.t) {
      const def = this.definitions[this.definition.t];
      if (
        def.children &&
        def.children.length === 1 &&
        ['string', 'integer', 'boolean', 'array', 'object'].includes(def.children[0].t)
      ) {
        this.isSimpleSingleton = true;
        this.nextDefinition = { ...def.children[0], key: this.definition.key };
      } else if (this.definition.t) {
        this.isComplexNested = true;
        this.nextDefinition = def;
      }
    } else if (this.definition.children) {
      this.isJustChildren = true;
    }
  }
}

class KubernetesManifestEditorNestedComponent implements IComponentOptions {
  public bindings: any = { definitions: '<', definition: '<' };
  public controller: any = KubernetesEditorNestedCtrl;
  public controllerAs = 'ctrl';
  public template = `
  <div class="clearme" ng-if="ctrl.definition.key && ctrl.isComplexNested">
    <label title="{{ctrl.definition.key}}" class="col-md-3">
      {{ctrl.definition.key}}
    </label>
  </div>
  <kubernetes-manifest-editor-switch
    ng-if="ctrl.isSimpleSingleton"
    definitions="ctrl.definitions"
    definition="ctrl.nextDefinition" />
  <div class="nested" ng-if="ctrl.isComplexNested">
    <div ng-repeat="child in ctrl.nextDefinition.children">
      <kubernetes-manifest-editor-switch definition="child" definitions="ctrl.definitions" />
    </div>
  </div>
  <kubernetes-manifest-editor-switch ng-if="ctrl.isJustChildren" ng-repeat="child in ctrl.definition.children" definition="child" definitions="ctrl.definitions" />
  `;
}

export const KUBERNETES_MANIFEST_EDITOR_NESTED = 'spinnaker.kubernetes.v2.kubernetes.manifest.editor.nested.component';

module(KUBERNETES_MANIFEST_EDITOR_NESTED, []).component(
  'kubernetesManifestEditorNested',
  new KubernetesManifestEditorNestedComponent(),
);
