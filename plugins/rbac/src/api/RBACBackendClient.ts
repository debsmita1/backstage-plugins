import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';

// @public
export type RBACAPI = {
  getUserAuthorization: () => Promise<any>;
  getRoles: () => Promise<any>;
  getRole: () => Promise<any>;
  createRole: () => Promise<any>;
  deleteRole: () => Promise<any>;
  updateRole: () => Promise<any>;
  createPolicy: () => Promise<any>;
  listPermissions: () => Promise<any>;
  deleteUserOrGroupFromRole: () => Promise<any>;
};

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

// @public
export const rbacApiRef = createApiRef<RBACAPI>({
  id: 'plugin.rbac.service',
});

export class RBACBackendClient implements RBACAPI {
  // @ts-ignore
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  async getUserAuthorization() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/`, {
      headers: {
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
    });
    return jsonResponse.json();
  }

  async getRoles() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/roles`, {
      headers: {
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
    });
    return jsonResponse.json();
  }

  async createRole() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const query = {
      name: 'role:default/my-roles',
      memberReferences: ['user:default/debsmita1', 'user:default/alice'],
    };
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/roles`, {
      headers: {
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(query),
    });
    return jsonResponse.json();
  }

  async getRole() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/role/default/guests`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'GET',
      },
    );
    return jsonResponse.json();
  }

  async updateRole() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const query = {
      oldRole: {
        memberReferences: ['user:default/guest'],
        name: 'role:default/guests',
      },
      newRole: {
        name: 'role:default/guestss',
        memberReferences: ['user:default/debsmita12'],
      },
    };
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/role/default/guests`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify(query),
      },
    );
    return jsonResponse.json();
  }

  async deleteUserOrGroupFromRole() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/role/default/rbac_admin?memberReferences=user:default/debsmita1`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'DELETE',
      },
    );
    return jsonResponse.json();
  }

  async deleteRole() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/role/default/guests`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'DELETE',
      },
    );
    return jsonResponse.json();
  }

  async listPermissions() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/plugins/policies`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'GET',
      },
    );
    return jsonResponse.json();
  }

  async createPolicy() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const query = {
      entityReference: 'role:default/guests',
      permission: 'catalog-entity',
      policy: 'read',
      effect: 'allow',
    };
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/policies`, {
      headers: {
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(query),
    });
    return jsonResponse.json();
  }
}
