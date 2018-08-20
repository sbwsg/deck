import * as React from 'react';
import { IArtifact } from 'core';

interface IArtifactComponentProps {
  artifact: IArtifact;
  onChange: (artifact: IArtifact) => void;
  labelColumns: number;
  fieldColumns: number;
}

export interface IArtifactKindConfig {
  label: string;
  type?: string;
  description: string;
  key: string;
  isDefault: boolean;
  isMatch: boolean;
  isPubliclyAccessible?: boolean;
  template: string;
  cmp?: React.SFC<IArtifactComponentProps>;
  controller: Function;
  controllerAs?: string;
}
