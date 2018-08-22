import * as React from 'react';
import { module } from 'angular';
import { react2angular } from 'react2angular';
import { isFunction, bindAll } from 'lodash';
import {
  IArtifactAccount,
  IArtifact,
  IArtifactKindConfig,
  IExpectedArtifact,
  Registry,
  ExpectedArtifactService,
} from 'core';
import { ArtifactKindSelect } from './ArtifactKindSelect';

export interface IInlineArtifactEditorProps {
  accounts: IArtifactAccount[];
  expectedArtifacts: IExpectedArtifact[];
  excludedArtifactTypes: RegExp[];
  offeredArtifactTypes: RegExp[];
  onChange: (ea: IExpectedArtifact, a: IArtifactAccount) => void;
  selectedAccountName: string;
  selectedArtifactId: string;
  showIcons: boolean;
}

export interface IInlineArtifactEditorState {
  expectedArtifact: IExpectedArtifact;
  selectedAccountName: string;
  selectedArtifactId: string;
}

export class InlineArtifactEditor extends React.Component<IInlineArtifactEditorProps, IInlineArtifactEditorState> {
  constructor(props: IInlineArtifactEditorProps) {
    super(props);
    bindAll(this, ['onChangeKind', 'onEditArtifact', 'onChangeArtifactAccount']);
    const state: IInlineArtifactEditorState = {
      selectedAccountName: props.selectedAccountName,
      selectedArtifactId: props.selectedArtifactId,
      expectedArtifact: null,
    };
    if (props.selectedArtifactId) {
      state.expectedArtifact = props.expectedArtifacts.find(ea => ea.id === props.selectedArtifactId);
    }
    this.state = state;
  }

  private onChangeKind(newConfig: IArtifactKindConfig) {
    let expectedArtifact = null;
    let selectedArtifactId = null;
    if (newConfig == null) {
      this.setState({ selectedArtifactId: null });
    } else {
      expectedArtifact = ExpectedArtifactService.createEmptyArtifact(newConfig.key);
      selectedArtifactId = expectedArtifact.id;
    }
    this.setState({
      expectedArtifact,
      selectedArtifactId,
    });
    this.publishExpectedArtifact(expectedArtifact);
  }

  private onEditArtifact(artifact: IArtifact) {
    const updated = {
      ...this.state.expectedArtifact,
      matchArtifact: artifact,
    };
    this.setState({
      expectedArtifact: updated,
    });
    this.publishExpectedArtifact(updated);
  }

  private onChangeArtifactAccount(account: IArtifactAccount) {
    this.setState({ selectedAccountName: account.name });
    this.publishAccount(account);
  }

  private publishExpectedArtifact(artifact: IExpectedArtifact) {
    if (isFunction(this.props.onChange)) {
      const account = this.props.accounts.find(a => a.name === this.state.selectedAccountName);
      this.props.onChange(artifact, account);
    }
  }

  private publishAccount(account: IArtifactAccount) {
    if (isFunction(this.props.onChange)) {
      this.props.onChange(this.state.expectedArtifact, account);
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
        if (this.props.offeredArtifactTypes) {
          if (!this.props.offeredArtifactTypes.find(t => t.test(ak.type))) {
            return false;
          }
        }
        if (this.props.excludedArtifactTypes) {
          if (this.props.excludedArtifactTypes.find(t => t.test(ak.type))) {
            return false;
          }
        }
      }
      return true;
    });
  }

  public render(): any {
    const kinds = Registry.pipeline.getArtifactKinds();
    const value = this.state.expectedArtifact;
    const valueKind = !!value ? kinds.find(ak => ak.type === value.matchArtifact.type) : null;
    const ValueCmp = valueKind && valueKind.cmp;
    return (
      <div className="form-group">
        <div>
          <label className="col-md-3 sm-label-right">Type</label>
          <ArtifactKindSelect
            kinds={this.kindOptions(kinds)}
            selected={valueKind}
            className="col-md-8"
            onChange={this.onChangeKind}
          />
        </div>
        {ValueCmp && (
          <div>
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
    'expectedArtifacts',
    'excludedArtifactTypes',
    'offeredArtifactTypes',
    'selectedAccountName',
    'selectedArtifactId',
    'showIcons',
    'onChange',
  ]),
);
