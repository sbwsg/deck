import * as React from 'react';
import { DateTime } from 'luxon';
import { get, memoize } from 'lodash';
import { UISref } from '@uirouter/react';
import { API } from 'core/api/ApiService';
import { PipelineTemplateV2Service } from './pipelineTemplateV2.service';
import { IPipelineTemplateV2 } from 'core/domain/IPipelineTemplateV2';
import { ReactModal } from 'core/presentation';
import {
  ShowPipelineTemplateJsonModal,
  IShowPipelineTemplateJsonModalProps,
} from 'core/pipeline/config/actions/templateJson/ShowPipelineTemplateJsonModal';
import { ReactInjector } from 'core/reactShims';
import { PipelineTemplateReader } from '../PipelineTemplateReader';

import './PipelineTemplatesV2.less';

export interface IPipelineTemplatesV2State {
  templates: IPipelineTemplateV2[];
  fetchError: string;
  searchValue: string;
}

export const PipelineTemplatesV2Error = (props: { message: string }) => {
  return (
    <div className="pipeline-templates-error-banner horizontal middle center heading-4">
      <i className="fa fa-exclamation-triangle" />
      <span>{props.message}</span>
    </div>
  );
};

export class PipelineTemplatesV2 extends React.Component<{}, IPipelineTemplatesV2State> {
  constructor(props: {}) {
    super(props);
    const { $stateParams } = ReactInjector;
    const templateId: string = $stateParams.templateId;
    this.state = { templates: [], fetchError: null, searchValue: '', templateId };
  }

  public componentDidMount() {
    const fetchPromise = this.fetchTemplates();
    if (this.state.templateId) {
      fetchPromise.then(() => {
        const template = this.state.templates.find(t => {
          return PipelineTemplateV2Service.idForTemplate(t) === this.state.templateId;
        });
        this.showTemplateJson(template);
      });
    }
  }

  private fetchTemplates = () => {
    const templatesPromise = PipelineTemplateReader.getV2PipelineTemplateList();
    return new Promise((resolve, reject) => {
      templatesPromise.then(
        templates => {
          this.setState({ templates: this.sortTemplates(templates) }, resolve);
        },
        err => {
          if (err) {
            const message: string = get(err, 'data.message') || get(err, 'message') || String(err);
            this.setState({ fetchError: message }, () => reject(new Error(message)));
          } else {
            this.setState({ fetchError: 'Unknown error' }, () => reject(new Error('Unknown error')));
          }
        },
      );
    });
  };

  private sortTemplates = (templates: IPipelineTemplateV2[]) => {
    return templates.sort((a: IPipelineTemplateV2, b: IPipelineTemplateV2) => {
      const aEpoch = Number.parseInt(a.updateTs, 10);
      const bEpoch = Number.parseInt(b.updateTs, 10);
      if (isNaN(aEpoch)) {
        return 1;
      } else if (isNaN(bEpoch)) {
        return -1;
      } else {
        return bEpoch - aEpoch;
      }
    });
  };

  private getUpdateTimeForTemplate = (template: IPipelineTemplateV2) => {
    const millis = Number.parseInt(template.updateTs, 10);
    if (isNaN(millis)) {
      return '';
    }
    const dt = DateTime.fromMillis(millis);
    return dt.toLocaleString(DateTime.DATETIME_SHORT);
  };

  // Updates the URL to remove any pipeline ID from the path.
  private onDetailModalClosed = () => {
    ReactInjector.$state.go('home.pipeline-templates');
  };

  private showTemplateJson = (template: IPipelineTemplateV2) => {
    const props = {
      template,
      editable: false,
      modalHeading: 'View Pipeline Template',
      descriptionText: 'The JSON below contains the metadata, variables and pipeline definition for this template.',
    };
    ReactModal.show<IShowPipelineTemplateJsonModalProps>(ShowPipelineTemplateJsonModal, props, {
      dialogClassName: 'modal-lg modal-fullscreen',
    }).then(this.onDetailModalClosed, this.onDetailModalClosed);
  };

  private deleteTemplate = (template: IPipelineTemplateV2) => {
    let request = API.one('v2')
      .one('pipelineTemplates')
      .one(template.id);

    const params: { digest?: string; version?: string } = {};
    if (template.digest) {
      params.digest = template.digest;
    } else if (template.version) {
      params.version = template.version;
    }
    request = request.withParams(params);

    request.remove().then(
      () => {
        this.fetchTemplates();
      },
      (err: Error) => {
        console.error('Unsuccessful delete', err, arguments);
      },
    );
  };

  private onSearchFieldChanged = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const searchValue: string = get(event, 'target.value', '');
    this.setState({ searchValue });
  };

  // Creates a cache key suitable for _.memoize
  private filterMemoizeResolver = (templates: IPipelineTemplateV2[], query: string): string => {
    return templates.reduce((s, t) => s + PipelineTemplateV2Service.idForTemplate(t), '') + query;
  };

  private filterSearchResults = memoize((templates: IPipelineTemplateV2[], query: string): IPipelineTemplateV2[] => {
    const searchValue = query.trim().toLowerCase();
    if (!searchValue) {
      return templates;
    } else {
      const searchResults = templates.filter(template => {
        const name = get(template, 'metadata.name', '').toLowerCase();
        const description = get(template, 'metadata.description', '').toLowerCase();
        const owner = get(template, 'metadata.owner', '').toLowerCase();
        return name.includes(searchValue) || description.includes(searchValue) || owner.includes(searchValue);
      });
      return this.sortTemplates(searchResults);
    }
  }, this.filterMemoizeResolver);

  public render() {
    const { templates, searchValue, fetchError } = this.state;
    const searchPerformed = searchValue.trim() !== '';
    const filteredResults = this.filterSearchResults(templates, searchValue);
    const resultsAvailable = filteredResults.length > 0;
    return (
      <>
        <div className="infrastructure">
          <div className="infrastructure-section search-header">
            <div className="container">
              <h2 className="header-section">
                <span className="search-label">Pipeline Templates</span>
                <input
                  type="search"
                  placeholder="Search pipeline templates"
                  className="form-control input-md"
                  ref={input => input && input.focus()}
                  onChange={this.onSearchFieldChanged}
                  value={searchValue}
                />
              </h2>
            </div>
          </div>
          <div className="infrastructure-section">
            {fetchError && (
              <div className="container">
                <PipelineTemplatesV2Error message={`There was an error fetching pipeline templates: ${fetchError}`} />
              </div>
            )}
            {searchPerformed && !resultsAvailable && (
              <div className="container">
                <h4>No matches found for '{searchValue}'</h4>
              </div>
            )}
            {resultsAvailable && (
              <div className="container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Owner</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map(template => {
                      const { metadata } = template;
                      return (
                        <tr key={PipelineTemplateV2Service.idForTemplate(template)}>
                          <td>{metadata.name || '-'}</td>
                          <td>{metadata.owner || '-'}</td>
                          <td>{this.getUpdateTimeForTemplate(template) || '-'}</td>
                          <td className="pipeline-template-actions">
                            <UISref
                              to={`.pipeline-templates-detail`}
                              params={{ templateId: PipelineTemplateV2Service.idForTemplate(template) }}
                            >
                              <button className="link" onClick={() => this.showTemplateJson(template)}>
                                View
                              </button>
                            </UISref>
                            <button className="link" onClick={() => this.deleteTemplate(template)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}
