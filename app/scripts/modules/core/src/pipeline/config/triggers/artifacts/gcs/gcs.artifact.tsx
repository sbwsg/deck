import { module } from 'angular';
import * as React from 'react';
import { isFinite } from 'lodash';

import { IArtifact } from 'core/domain/IArtifact';
import { Registry } from 'core/registry';

export const GCS_ARTIFACT = 'spinnaker.core.pipeline.trigger.gcs.artifact';
module(GCS_ARTIFACT, []).config(() => {
  Registry.pipeline.registerArtifactKind({
    label: 'GCS',
    type: 'gcs/object',
    description: 'A GCS object.',
    key: 'gcs',
    isDefault: false,
    isMatch: true,
    controller: function(artifact: IArtifact) {
      'ngInject';
      this.artifact = artifact;
      this.artifact.type = 'gcs/object';
    },
    controllerAs: 'ctrl',
    template: `
<div class="col-md-12">
  <div class="form-group row">
    <label class="col-md-2 sm-label-right">
      Object path
      <help-field key="pipeline.config.expectedArtifact.gcs.name"></help-field>
    </label>
    <div class="col-md-8">
      <input type="text"
             placeholder="gs://bucket/path/to/file"
             class="form-control input-sm"
             ng-model="ctrl.artifact.name"/>
    </div>
  </div>
</div>
`,
    cmp: props => {
      const labelColumns = isFinite(props.labelColumns) ? props.labelColumns : 2;
      const fieldColumns = isFinite(props.fieldColumns) ? props.fieldColumns : 8;
      const labelClassName = 'col-md-' + labelColumns;
      const fieldClassName = 'col-md-' + fieldColumns;
      return (
        <div className="col-md-12">
          <div className="form-group row">
            <label className={labelClassName + ' sm-label-right'}>Object path</label>
            <div className={fieldClassName}>
              <input
                type="text"
                placeholder="gs://bucket/path/to/file"
                className="form-control input-sm"
                value={props.artifact.name || ''}
                onChange={e => {
                  const clone = { ...props.artifact };
                  clone.name = e.target.value;
                  props.onChange(clone);
                }}
              />
            </div>
          </div>
        </div>
      );
    },
  });
});
