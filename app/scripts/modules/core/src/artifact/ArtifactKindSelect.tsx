import * as React from 'react';
import { isFunction, bindAll } from 'lodash';
import { TetheredSelect, IArtifactKindConfig } from 'core';

export interface IArtifactKindSelectProps {
  kinds: IArtifactKindConfig[];
  selected: IArtifactKindConfig;
  onChange: (ak: IArtifactKindConfig) => void;
  className?: string;
}

export class ArtifactKindSelect extends React.Component<IArtifactKindSelectProps> {
  constructor(props: IArtifactKindSelectProps) {
    super(props);
    bindAll(this, ['onChange']);
  }

  private renderOption(o: IArtifactKindConfig) {
    return (
      <span>
        {o.label} - {o.description}
      </span>
    );
  }

  private onChange(ak: IArtifactKindConfig) {
    if (isFunction(this.props.onChange)) {
      this.props.onChange(ak);
    }
  }

  public render() {
    return (
      <TetheredSelect
        className={this.props.className || ''}
        options={this.props.kinds}
        optionRenderer={this.renderOption}
        value={this.props.selected}
        valueRenderer={this.renderOption}
        onChange={this.onChange}
      />
    );
  }
}
