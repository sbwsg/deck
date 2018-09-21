import * as React from 'react';
import { noop } from 'lodash';
import { IArtifact, ArtifactIconService } from '@spinnaker/core';

export interface IArtifactIconListProps {
  artifacts: IArtifact[];
  onClick?: (a: IArtifact) => void;
}

export const ArtifactIconList = (props: IArtifactIconListProps): any => {
  return props.artifacts.map((artifact, i) => {
    const { location, reference, type } = artifact;
    const iconPath = ArtifactIconService.getPath(type);
    const key = `${location || ''}${type || ''}${reference || ''}` || String(i);
    const classname = `artifact-list-item-name ${props.onClick ? 'clickable' : ''}`;
    let onClick = noop;
    if (props.onClick) {
      onClick = () => props.onClick(artifact);
    }
    return (
      <div key={key} className="artifact-list-item" title={artifact.type}>
        {iconPath && <img className="artifact-list-item-icon" width="20" height="20" src={iconPath} />}
        <span className={classname} onClick={onClick}>
          {artifact.name}
          {artifact.version && <span> - {artifact.version}</span>}
        </span>
      </div>
    );
  });
};
