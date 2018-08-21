import * as React from 'react';
import { module } from 'angular';
import { react2angular } from 'react2angular';
import { bindAll, get } from 'lodash';
import {
  IArtifactAccount,
  IArtifactKindConfig,
  IArtifact,
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
  onChangeArtifact: (ea: IExpectedArtifact) => void;
  onChangeArtifactAccount: (a: IArtifactAccount) => void;
  selectedAccountId: string;
  selectedArtifactId: string;
  showIcons: boolean;
}

interface IInlineArtifactCache {
  [type: string]: IExpectedArtifact;
}

export interface IInlineArtifactEditorState {
  currentEditArtifact: IExpectedArtifact;
  editedArtifactCache: IInlineArtifactCache;
  selectedAccountId: string;
  selectedArtifactId: string;
}

export class InlineArtifactEditor extends React.Component<IInlineArtifactEditorProps, IInlineArtifactEditorState> {
  private fallbackCacheKey = 'custom';

  constructor(props: IInlineArtifactEditorProps) {
    super(props);
    bindAll(this, ['onChangeArtifactType', 'onChangeArtifact', 'onChangeArtifactAccount']);
    this.onChangeArtifactType = this.onChangeArtifactType.bind(this);
    const currentEditArtifact = props.selectedArtifactId
      ? props.artifacts.find(a => a.id === props.selectedArtifactId)
      : null;
    const artifactType = get(currentEditArtifact, ['matchArtifact', 'type'], this.fallbackCacheKey);
    const cache = currentEditArtifact ? { [artifactType]: currentEditArtifact } : {};
    this.state = {
      currentEditArtifact,
      editedArtifactCache: cache,
      selectedAccountId: props.selectedAccountId,
      selectedArtifactId: props.selectedArtifactId,
    };
  }

  private cacheHas(type: string): boolean {
    return !!this.state.editedArtifactCache[type || this.fallbackCacheKey];
  }

  private cacheGet(type: string): IExpectedArtifact {
    return this.state.editedArtifactCache[type || this.fallbackCacheKey];
  }

  private cacheSet(type: string, ea: IExpectedArtifact) {
    if (type == null) {
      type = this.fallbackCacheKey;
    }
    const cache = { ...this.state.editedArtifactCache, [type]: ea };
    this.setState({ editedArtifactCache: cache });
    console.log('cache set', cache);
  }

  private baseArtifact(type: string) {
    return {
      type: type || this.fallbackCacheKey,
    };
  }

  private onChangeArtifactType(newConfig: IArtifactKindConfig) {
    console.log('onChangeArtifactType', newConfig);
    let artifact: IExpectedArtifact;
    if (newConfig == null) {
      artifact = null;
    } else if (this.cacheHas(newConfig.type)) {
      artifact = this.cacheGet(newConfig.type);
    } else {
      artifact = {
        matchArtifact: this.baseArtifact(newConfig.type),
        defaultArtifact: this.baseArtifact(newConfig.type),
        id: UUIDGenerator.generateUuid(),
        usePriorArtifact: false,
        useDefaultArtifact: false,
      };
      this.cacheSet(newConfig.type, artifact);
      this.setState({ selectedArtifactId: artifact.id });
    }
    this.setState({
      currentEditArtifact: artifact,
    });
  }

  private onChangeArtifact(artifact: IArtifact) {
    const { currentEditArtifact } = this.state;
    const updatedArtifact = {
      ...currentEditArtifact,
      matchArtifact: artifact,
    };
    console.log('updatedArtifact', updatedArtifact);
    this.cacheSet(artifact.type, updatedArtifact);
    this.setState({
      currentEditArtifact: updatedArtifact,
    });
  }

  private onChangeArtifactAccount(account: IArtifactAccount) {
    this.setState({ selectedAccountId: account.name });
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
      console.log('opt', o),
      (
        <span>
          {o.label} - {o.description}
        </span>
      )
    );
    const valRenderer = (v: IExpectedArtifact) => {
      if (v && v.matchArtifact) {
        return <span>{optRenderer(artifactKinds.find(ak => ak.type === v.matchArtifact.type))}</span>;
      } else {
        return <span>Nothing selected!</span>;
      }
    };
    const value = this.state.currentEditArtifact;
    const valueKindConfig =
      value && artifactKinds.find(ak => ak.type === value.matchArtifact.type || ak.key === this.fallbackCacheKey);
    const ValueCmp = valueKindConfig && valueKindConfig.cmp;
    console.log('render', 'options', options, 'value', value, 'valueKindConfig', valueKindConfig);
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

export const INLINE_ARTIFACT_EDITOR = 'spinnaker.core.artifact.inline.editor';
module(INLINE_ARTIFACT_EDITOR, []).component(
  'inlineArtifactEditor',
  react2angular(InlineArtifactEditor, [
    'accounts',
    'artifacts',
    'excludedArtifactTypes',
    'offeredArtifactTypes',
    'selectedAccountId',
    'selectedArtifactId',
    'showIcons',
  ]),
);
