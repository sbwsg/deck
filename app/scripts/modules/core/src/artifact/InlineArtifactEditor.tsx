import * as React from 'react';
import { module } from 'angular';
import { react2angular } from 'react2angular';
import { isFunction, bindAll, cloneDeep } from 'lodash';
import { IArtifactAccount, IArtifact, IArtifactKindConfig, IExpectedArtifact, Registry } from 'core';
import { ArtifactKindSelect } from './ArtifactKindSelect';

export interface IInlineArtifactEditorProps {
  accounts: IArtifactAccount[];
  expectedArtifact: IExpectedArtifact;
  excludedTypes: RegExp[];
  offeredTypes: RegExp[];
  onChange: (ea: IExpectedArtifact, a: IArtifactAccount) => void;
  selectedAccountName: string;
  showIcons: boolean;
}

export class InlineArtifactEditor extends React.Component<IInlineArtifactEditorProps> {
  constructor(props: IInlineArtifactEditorProps) {
    super(props);
    bindAll(this, ['onChangeKind', 'onEditArtifact', 'onChangeArtifactAccount']);
  }

  private onChangeKind(newConfig: IArtifactKindConfig) {
    if (newConfig == null) {
      this.publishExpectedArtifact(null);
    } else {
      const artifact = cloneDeep(this.props.expectedArtifact);
      artifact.matchArtifact.kind = newConfig.key;
      if (newConfig.type) {
        artifact.matchArtifact.type = newConfig.type;
      }
      this.publishExpectedArtifact(artifact);
    }
  }

  private onEditArtifact(artifact: IArtifact) {
    const expectedArtifact = { ...this.props.expectedArtifact, matchArtifact: artifact };
    this.setState({ expectedArtifact });
    this.publishExpectedArtifact(expectedArtifact);
  }

  private onChangeArtifactAccount(account: IArtifactAccount) {
    this.setState({ selectedAccountName: account.name });
    this.publishAccount(account);
  }

  private publishExpectedArtifact(artifact: IExpectedArtifact) {
    const account = this.props.accounts.find(a => a.name === this.props.selectedAccountName);
    this.publish(artifact, account);
  }

  private publishAccount(account: IArtifactAccount) {
    this.publish(this.props.expectedArtifact, account);
  }

  private publish(artifact: IExpectedArtifact, account: IArtifactAccount) {
    if (isFunction(this.props.onChange)) {
      this.props.onChange(artifact, account);
    }
  }

  private kindOptions(kinds: IArtifactKindConfig[]): IArtifactKindConfig[] {
    return kinds.filter(ak => {
      if (!ak.isMatch) {
        return false;
      }
      if (ak.type != null) {
        if (!ak.isPubliclyAccessible) {
          if (this.props.accounts == null || !this.props.accounts.find(a => a.types.includes(ak.type))) {
            return false;
          }
        }
        if (this.props.offeredTypes) {
          if (!this.props.offeredTypes.find(t => t.test(ak.type))) {
            return false;
          }
        }
        if (this.props.excludedTypes) {
          if (this.props.excludedTypes.find(t => t.test(ak.type))) {
            return false;
          }
        }
      }
      return true;
    });
  }

  public render(): any {
    const kinds = Registry.pipeline.getArtifactKinds();
    const value = this.props.expectedArtifact;
    const valueKind = !!value ? kinds.find(ak => ak.key === value.matchArtifact.kind) : null;
    const ValueCmp = valueKind && valueKind.cmp;
    return (
      <div>
        <div className="form-group">
          <div>
            <label className="col-md-3 sm-label-right" />
            <ArtifactKindSelect
              kinds={this.kindOptions(kinds)}
              selected={valueKind}
              className="col-md-8"
              onChange={this.onChangeKind}
            />
          </div>
        </div>
        {ValueCmp && (
          <div className="form-group">
            <ValueCmp artifact={value.matchArtifact} labelColumns={3} fieldColumns={8} onChange={this.onEditArtifact} />
          </div>
        )}
      </div>
    );
  }
}

export const INLINE_ARTIFACT_EDITOR = 'spinnaker.core.artifact.inline.editor';
module(INLINE_ARTIFACT_EDITOR, []).component(
  'inlineArtifactEditor',
  react2angular(InlineArtifactEditor, [
    'accounts',
    'expectedArtifact',
    'excludedTypes',
    'offeredTypes',
    'selectedAccountName',
    'showIcons',
    'onChange',
  ]),
);
