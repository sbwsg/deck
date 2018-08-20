import { IArtifact } from 'core/domain/IArtifact';

export interface IExpectedArtifact {
  boundArtifact?: IArtifact;
  defaultArtifact: IArtifact;
  id: string;
  matchArtifact: IArtifact;
  useDefaultArtifact: boolean;
  usePriorArtifact: boolean;
}
