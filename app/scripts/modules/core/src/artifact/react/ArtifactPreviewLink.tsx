import { module } from 'angular';
import * as React from 'react';
import { react2angular } from 'react2angular';
import { API } from 'core';
import { IArtifact } from 'core/domain';

export interface ArtifactPreviewLinkProps {
  artifact: IArtifact;
  account: string;
}

export class ArtifactPreviewLink extends React.Component<ArtifactPreviewLinkProps> {
  fetchArtifact = () => {
    const { artifact, account } = this.props;
    const data = { ...artifact };
    if (account) {
      data.artifactAccount = account;
    }
    API.one('artifacts', 'fetch')
      .put(data)
      .then(result => {
        console.log('fetchArtifact result', result);
      });
  };

  render() {
    return (
      <button onClick={this.fetchArtifact} className="btn-primary clickable">
        Preview
      </button>
    );
  }
}

export const ARTIFACT_PREVIEW_LINK_COMPONENT = 'spinnaker.core.artifacts.artifact.preview.link';
module(ARTIFACT_PREVIEW_LINK_COMPONENT, []).component(
  'artifactPreviewLink',
  react2angular(ArtifactPreviewLink, ['artifact', 'account']),
);
