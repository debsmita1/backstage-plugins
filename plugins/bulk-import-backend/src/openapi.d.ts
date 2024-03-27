import type {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios'; 

declare namespace Components {
    namespace Schemas {
        export type ApprovalTool = "GIT" | "SERVICENOW";
        /**
         * Import Job
         */
        export interface Import {
            id?: string;
            status?: /* Import Job status */ ImportStatus;
            errors?: string[];
            approvalTool?: ApprovalTool;
            repository?: {
                /**
                 * repository name
                 */
                name?: string;
                /**
                 * repository URL
                 */
                url?: string;
                /**
                 * organization which the repository is part of
                 */
                organization?: string;
            };
            /**
             * GitHub details. Applicable if approvalTool is git.
             */
            github?: {
                pullRequest?: {
                    /**
                     * URL of the Pull Request
                     */
                    url?: string;
                };
            };
        }
        /**
         * Import Job request
         */
        export interface ImportRequest {
            approvalTool?: ApprovalTool;
            repository?: {
                /**
                 * repository name
                 */
                name?: string;
                /**
                 * repository URL
                 */
                url?: string;
                /**
                 * organization which the repository is part of
                 */
                organization?: string;
            };
            /**
             * content of the catalog-info.yaml to include in the import Pull Request.
             */
            catalogInfoContent?: string;
            /**
             * GitHub details. Applicable if approvalTool is git.
             */
            github?: {
                /**
                 * Pull Request details. Applicable if approvalTool is git.
                 */
                pullRequest?: {
                    /**
                     * title of the Pull Request
                     */
                    title?: string;
                    /**
                     * body of the Pull Request
                     */
                    body?: string;
                };
            };
        }
        /**
         * Import Job status
         */
        export type ImportStatus = "WAIT_APPROVAL" | "ADDED" | "WAIT_PR_START" | "WAIT_PR_APPROVAL" | "PR_REJECTED" | "WAIT_SERVICENOW_START" | "WAIT_SERVICENOW_RESOLUTION" | "PR_ERROR" | "SERVICENOW_ERROR" | "SERVICENOW_TICKET_REJECTED" | null;
        /**
         * Repository
         */
        export interface Repository {
            /**
             * unique identifier
             */
            id?: string;
            /**
             * repository name
             */
            name?: string;
            /**
             * repository URL
             */
            url?: string;
            /**
             * organization which the repository is part of
             */
            organization?: string;
            /**
             * base content of the catalog-info.yaml to include in the import Pull Request.
             */
            defaultCatalogInfo?: string;
            importStatus?: /* Import Job status */ ImportStatus;
        }
    }
}
declare namespace Paths {
    namespace CreateImportJobs {
        export type RequestBody = /* Import Job request */ Components.Schemas.ImportRequest[];
        namespace Responses {
            export type $202 = /* Import Job */ Components.Schemas.Import[];
        }
    }
    namespace FindAllImports {
        namespace Responses {
            export type $200 = /* Import Job */ Components.Schemas.Import[];
        }
    }
    namespace FindAllRepositories {
        namespace Responses {
            export type $200 = /* Repository */ Components.Schemas.Repository[];
        }
    }
    namespace Ping {
        namespace Responses {
            export interface $200 {
                status?: "ok";
            }
        }
    }
}

export interface OperationMethods {
  /**
   * ping - Check the health of the bulk-import backend router
   */
  'ping'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.Ping.Responses.$200>
  /**
   * findAllRepositories - Fetch Organization Repositories accessible by Backstage Github Integrations
   */
  'findAllRepositories'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.FindAllRepositories.Responses.$200>
  /**
   * findAllImports - Fetch Import Jobs
   */
  'findAllImports'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.FindAllImports.Responses.$200>
  /**
   * createImportJobs - Submit Import Jobs
   */
  'createImportJobs'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateImportJobs.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateImportJobs.Responses.$202>
}

export interface PathsDictionary {
  ['/ping']: {
    /**
     * ping - Check the health of the bulk-import backend router
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.Ping.Responses.$200>
  }
  ['/repositories']: {
    /**
     * findAllRepositories - Fetch Organization Repositories accessible by Backstage Github Integrations
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.FindAllRepositories.Responses.$200>
  }
  ['/imports']: {
    /**
     * findAllImports - Fetch Import Jobs
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.FindAllImports.Responses.$200>
    /**
     * createImportJobs - Submit Import Jobs
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateImportJobs.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateImportJobs.Responses.$202>
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
