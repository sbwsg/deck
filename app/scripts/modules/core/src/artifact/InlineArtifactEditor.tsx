import * as React from 'react';
import { module } from 'angular';
import { react2angular } from 'react2angular';
import {
  IArtifactAccount,
  IArtifactKindConfig,
  IExpectedArtifact,
  Registry,
  TetheredSelect,
  UUIDGenerator,
} from 'core';

export interface IInlineArtifactEditorProps {
  accounts: IArtifactAccount[];
  artifacts: IExpectedArtifact[];
  excludedArtifactTypes: RegExp[];
  offeredArtifactTypes: RegExp[];
  onEdit: (ea: IExpectedArtifact, a: IArtifactAccount) => void;
  selectedAccountId: string;
  selectedArtifactId: string;
  showIcons: boolean;
}

export interface IInlineArtifactEditorState {
  currentEditArtifact: IExpectedArtifact;
  editedArtifactCache: { [type: string]: IExpectedArtifact };
  selectedAccountId: string;
  selectedArtifactId: string;
}

export class InlineArtifactEditor extends React.Component<IInlineArtifactEditorProps, IInlineArtifactEditorState> {
  constructor(props: IInlineArtifactEditorProps) {
    super(props);
    this.onChangeArtifactType = this.onChangeArtifactType.bind(this);
    console.log('InlineArtifactEditor', props);
    const currentEditArtifact = props.selectedArtifactId
      ? props.artifacts.find(a => a.id === props.selectedArtifactId)
      : null;
    this.state = {
      currentEditArtifact,
      editedArtifactCache: currentEditArtifact
        ? { [currentEditArtifact.matchArtifact.type || 'custom']: currentEditArtifact }
        : {},
      selectedAccountId: props.selectedAccountId,
      selectedArtifactId: props.selectedArtifactId,
    };
  }

  private onChangeArtifactType(newConfig: IArtifactKindConfig) {
    console.log('onChangeArtifactType', newConfig);
    if (newConfig == null) {
      this.setState({
        currentEditArtifact: null,
      });
    } else if (this.state.editedArtifactCache.hasOwnProperty(newConfig.type || 'custom')) {
      this.setState({
        currentEditArtifact: this.state.editedArtifactCache[newConfig.type || 'custom'],
      });
    } else {
      const newArtifact: IExpectedArtifact = {
        matchArtifact: {
          type: newConfig.type,
        },
        defaultArtifact: {
          type: newConfig.type,
        },
        id: UUIDGenerator.generateUuid(),
        usePriorArtifact: false,
        useDefaultArtifact: false,
      };
      console.log('onChangeArtifactType', newArtifact);
      this.setState({
        currentEditArtifact: newArtifact,
        editedArtifactCache: { ...this.state.editedArtifactCache, [newConfig.type || 'custom']: newArtifact },
      });
    }
  }

  private onChangeArtifact(artifact: IArtifact) {
    const { currentEditArtifact, editedArtifactCache } = this.state;
    const updatedArtifact = {
      ...currentEditArtifact,
      matchArtifact: artifact,
    };
    console.log('updatedArtifact', updatedArtifact);
    const updatedCache = {
      ...editedArtifactCache,
      [artifact.type || 'custom']: updatedArtifact,
    };
    console.log('updatedCache for type', artifact.type, { updatedCache, editedArtifactCache });
    this.setState({
      currentEditArtifact: updatedArtifact,
      editedArtifactCache: updatedCache,
    });
  }

  private isOffered(ak: IArtifactKindConfig) {
    if (ak.type == null || this.props.offeredArtifactTypes == null) {
      return true;
    }
    return !!this.props.offeredArtifactTypes.find(t => t.test(ak.type));
  }

  private isExcluded(ak: IArtifactKindConfig) {
    if (ak.type == null || this.props.excludedArtifactTypes == null) {
      return false;
    }
    return !!this.props.excludedArtifactTypes.find(t => t.test(ak.type));
  }

  private hasAccount(ak: IArtifactKindConfig) {
    if (ak.type == null || ak.isPubliclyAccessible) {
      return true;
    }
    if (this.props.accounts == null || this.props.accounts.length === 0) {
      return false;
    }
    return !!this.props.accounts.find(acc => acc.types.includes(ak.type));
  }

  public render(): any {
    const artifactKinds = Registry.pipeline.getArtifactKinds();
    const options = artifactKinds.filter(
      ak => ak.isMatch && this.hasAccount(ak) && this.isOffered(ak) && !this.isExcluded(ak),
    );
    const optRenderer = (o: IArtifactKindConfig) => (
      <span>
        {o.label} - {o.description}
      </span>
    );
    const valRenderer = (v: IExpectedArtifact) => {
      if (v && v.matchArtifact) {
        return <span>{optRenderer(artifactKinds.find(ak => ak.type === v.matchArtifact.type))}</span>;
      } else {
        return <span>Nothing selected!</span>;
      }
    };
    const value = this.state.currentEditArtifact;
    console.log({ artifactKinds, options, value });
    const valueKindConfig = value && artifactKinds.find(ak => ak.type === value.matchArtifact.type);
    const ValueCmp = valueKindConfig && valueKindConfig.cmp;
    return (
      <div className="form-group">
        <div>
          <label className="col-md-3 sm-label-right">Type</label>
          <TetheredSelect
            className="col-md-8"
            options={options}
            optionRenderer={optRenderer}
            value={value}
            valueRenderer={valRenderer}
            onChange={this.onChangeArtifactType}
          />
        </div>
        {ValueCmp && (
          <div>
            <ValueCmp
              artifact={value.matchArtifact}
              labelColumns={3}
              fieldColumns={8}
              onChange={(newArtifact: IArtifact) => {
                console.log('On Change!', newArtifact);
                this.onChangeArtifact(newArtifact);
              }}
            />
          </div>
        )}
      </div>
    );
  }
}

console.log('Registering inline artifact editor as angular module');
export const INLINE_ARTIFACT_EDITOR = 'spinnaker.core.artifact.inline.editor';
module(INLINE_ARTIFACT_EDITOR, []).component(
  'inlineArtifactEditor',
  react2angular(InlineArtifactEditor, [
    'accounts',
    'artifacts',
    'excludedArtifactTypes',
    'offeredArtifactTypes',
    'onEdit',
    'selectedAccountId',
    'selectedArtifactId',
    'showIcons',
  ]),
);
