import * as React from 'react';
import { module } from 'angular';
import { react2angular } from 'react2angular';
import { Modal } from 'react-bootstrap';
import { noop } from 'lodash';
import { Spinner } from 'core/widgets/spinners/Spinner';
import {
  Application,
  ExpectedArtifactService,
  ModalClose,
  IManifest,
  IExpectedArtifact,
  IArtifactAccount,
} from '@spinnaker/core';

export interface IPreviewManifestArtifactButtonProps {
  expectedArtifact: IExpectedArtifact;
  account: IArtifactAccount;
}

export interface IPreviewManifestArtifactButtonState {
  show: boolean;
  artifactContents: string;
  artifactFetchError: any;
  loading: boolean;
}

class PreviewManifestArtifactButton extends React.Component<
  IPreviewManifestArtifactProps,
  IPreviewManifestArtifactState
> {
  constructor(props: IPreviewManifestArtifactButtonProps) {
    super(props);
    this.state = {
      show: false,
      artifactContents: '',
      artifactFetchError: null,
    };
  }

  private handleClick = () => {
    this.setState({ show: true, artifactContents: '', artifactError: null, loading: true });
    const { expectedArtifact, account } = this.props;
    if (expectedArtifact.matchArtifact && account) {
      ExpectedArtifactService.artifactContents(expectedArtifact.matchArtifact, account)
        .then((result: string) => {
          console.log('OK', { result });
          this.setState({ show: true, artifactContents: result, artifactError: null, loading: false });
        })
        .catch(e => {
          console.log('ERROR', e);
          this.setState({ show: true, artifactContents: '', artifactError: e, loading: false });
        });
    }
  };

  private onDismiss = () => {
    this.setState({ show: false });
  };

  public render() {
    const { expectedArtifact, account } = this.props;
    console.log({ expectedArtifact, account });
    if (!expectedArtifact || !account) {
      return null;
    }
    return (
      <>
        <Modal show={this.state.show} onHide={noop}>
          <ModalClose dismiss={this.onDismiss} />
          <div>
            <Modal.Header>
              <h3>Preview Manifest</h3>
            </Modal.Header>
            <Modal.Body>
              {this.state.loading && <Spinner size="large" />}
              <textarea style={{ width: '100%', height: '100%' }} value={this.state.artifactContents} rows={30} />
            </Modal.Body>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={this.onDismiss}>
                <span>Done</span>
              </button>
            </div>
          </div>
        </Modal>
        <a className="clickable" onClick={this.handleClick}>
          preview matching artifact
        </a>
      </>
    );
  }
}

export const KUBERNETES_PREVIEW_MANIFEST_ARTIFACT_BUTTON =
  'spinnaker.kubernetes.previewManifestArtifactButton.component';
module(KUBERNETES_PREVIEW_MANIFEST_ARTIFACT_BUTTON, []).component(
  'kubernetesPreviewManifestArtifactButton',
  react2angular(PreviewManifestArtifactButton, ['expectedArtifact', 'account']),
);
