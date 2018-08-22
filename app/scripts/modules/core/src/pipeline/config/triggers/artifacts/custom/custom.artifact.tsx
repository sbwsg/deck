import { IController, module } from 'angular';
import * as React from 'react';

import { IArtifact } from 'core/domain/IArtifact';
import { Registry } from 'core/registry';

class CustomArtifactController implements IController {
  constructor(public artifact: IArtifact) {
    'ngInject';
  }
}

export const CUSTOM_ARTIFACT = 'spinnaker.core.pipeline.trigger.custom.artifact';
module(CUSTOM_ARTIFACT, [])
  .config(() => {
    Registry.pipeline.registerArtifactKind({
      label: 'Custom',
      description: 'A custom-defined artifact.',
      key: 'custom',
      isDefault: true,
      isMatch: true,
      controller: function(artifact: IArtifact) {
        'ngInject';
        this.artifact = artifact;
      },
      controllerAs: 'ctrl',
      template: `
<div class="col-md-12">
  <div class="form-group row">
    <label class="col-md-2 sm-label-right">
      Type
    </label>
    <div class="col-md-3">
      <input type="text"
             class="form-control input-sm"
             ng-model="ctrl.artifact.type"/>
    </div>
    <label class="col-md-2 sm-label-right">
      Name
    </label>
    <div class="col-md-3">
      <input type="text"
             class="form-control input-sm"
             ng-model="ctrl.artifact.name"/>
    </div>
  </div>
  <div class="form-group row">
    <label class="col-md-2 sm-label-right">
      Version
    </label>
    <div class="col-md-3">
      <input type="text"
             class="form-control input-sm"
             ng-model="ctrl.artifact.version"/>
    </div>
    <label class="col-md-2 sm-label-right">
      Location
    </label>
    <div class="col-md-3">
      <input type="text"
             class="form-control input-sm"
             ng-model="ctrl.artifact.location"/>
    </div>
  </div>
  <div class="form-group row">
    <label class="col-md-2 sm-label-right">
      Reference
    </label>
    <div class="col-md-8">
      <input type="text"
             class="form-control input-sm"
             ng-model="ctrl.artifact.reference"/>
    </div>
  </div>
</div>
`,
      cmp: props => {
        const labelColumns = isFinite(props.labelColumns) ? props.labelColumns : 2;
        const fieldColumns = isFinite(props.fieldColumns) ? props.fieldColumns : 8;
        const labelClassName = 'col-md-' + labelColumns;
        const fieldClassName = 'col-md-' + fieldColumns;
        const input = (field: string) => (
          <input
            type="text"
            className="form-control input-sm"
            value={props.artifact[field] || ''}
            onChange={e => props.onChange({ ...props.artifact, [field]: e.target.value })}
          />
        );
        return (
          <div className="col-md-12">
            <div className="form-group row">
              <label className={labelClassName + ' sm-label-right'}>Type</label>
              <div className="col-md-3">{input('type')}</div>
              <label className={'col-md-2 sm-label-right'}>Name</label>
              <div className="col-md-3">{input('name')}</div>
            </div>
            <div className="form-group row">
              <label className={labelClassName + ' sm-label-right'}>Version</label>
              <div className="col-md-3">{input('version')}</div>
              <label className={'col-md-2 sm-label-right'}>Location</label>
              <div className="col-md-3">{input('location')}</div>
            </div>
            <div className="form-group row">
              <label className={labelClassName + ' sm-label-right'}>Reference</label>
              <div className={fieldClassName}>{input('reference')}</div>
            </div>
          </div>
        );
      },
    });
  })
  .controller('customArtifactCtrl', CustomArtifactController);
