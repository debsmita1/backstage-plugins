import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';

// @public
export type BulkImportAPI = {
  getRepositories: () => Promise<any | Response>;
};

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

// @public
export const bulkImportApiRef = createApiRef<BulkImportAPI>({
  id: 'plugin.bulk-import.service',
});

export class BulkImportBackendClient implements BulkImportAPI {
  // @ts-ignore
  private readonly configApi: ConfigApi;
  // private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
    // this.identityApi = options.identityApi;
  }

  // async getUserAuthorization() {
  //   const { token: idToken } = await this.identityApi.getCredentials();
  //   const backendUrl = this.configApi.getString('backend.baseUrl');
  //   const jsonResponse = await fetch(`${backendUrl}/api/permission/`, {
  //     headers: {
  //       ...(idToken && { Authorization: `Bearer ${idToken}` }),
  //     },
  //   });
  //   return jsonResponse.json();
  // }

  async getRepositories() {
    // const { token: idToken } = await this.identityApi.getCredentials();

    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/bulk-import-backend/repositories`,
      {
        headers: {
          // ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
          // Accept: 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return [];
    }
    return jsonResponse.json();
  }
}
