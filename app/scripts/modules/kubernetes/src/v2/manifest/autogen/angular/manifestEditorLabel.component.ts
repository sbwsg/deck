import { module, IController, IComponentOptions } from 'angular';

class KubernetesManifestEditorLabelCtrl implements IController {
  public definition: any;
}

class KubernetesManifestEditorLabelComponent implements IComponentOptions {
  public bindings: any = { definition: '<' };
  public controller: any = KubernetesManifestEditorLabelCtrl;
  public controllerAs = 'ctrl';
  public template = `
    <label title="{{ ctrl.definition.key }}" class="col-md-3" ng-if="ctrl.definition.key">
      {{ctrl.definition.key}}
      <help-field ng-if="ctrl.definition.help" content="{{ctrl.definition.help}}" />
    </label>
  `;
}

export const KUBERNETES_MANIFEST_EDITOR_LABEL = 'spinnaker.kubernetes.v2.kubernetes.manifest.editor.label.component';

module(KUBERNETES_MANIFEST_EDITOR_LABEL, []).component(
  'kubernetesManifestEditorLabel',
  new KubernetesManifestEditorLabelComponent(),
);
