/*
 * Copyright 2024 The Janus IDP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getVoidLogger } from '@backstage/backend-common';
import { CatalogClient } from '@backstage/catalog-client';
import { ConfigReader } from '@backstage/config';
import {
  AuthorizeResult,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';

import express from 'express';
import request from 'supertest';

import { CatalogInfoGenerator } from '../helpers';
import { GithubRepositoryResponse } from '../types';
import { GithubApiService } from './githubApiService';
import { createRouter } from './router';

const mockedAuthorize: jest.MockedFunction<PermissionEvaluator['authorize']> =
  jest.fn();
const mockedPermissionQuery: jest.MockedFunction<
  PermissionEvaluator['authorizeConditional']
> = jest.fn();

const mockUser = {
  type: 'User',
  userEntityRef: 'user:default/guest',
  ownershipEntityRefs: ['guest'],
};
const mockIdentityClient = {
  getIdentity: jest.fn().mockImplementation(async () => ({
    identity: mockUser,
  })),
};
const mockDiscovery = {
  getBaseUrl: jest.fn().mockResolvedValue('https://api.example.com'),
  getExternalBaseUrl: jest.fn().mockResolvedValue('https://api.example.com'),
};

const permissionEvaluator: PermissionEvaluator = {
  authorize: mockedAuthorize,
  authorizeConditional: mockedPermissionQuery,
};

const allowAll: PermissionEvaluator['authorize'] &
  PermissionEvaluator['authorizeConditional'] = async queries => {
  return queries.map(() => ({
    result: AuthorizeResult.ALLOW,
  }));
};

const mockAddLocation = jest.fn();
const mockValidateEntity = jest.fn();
const mockGetEntitiesByRefs = jest.fn();

const mockCatalogClient = {
  getEntitiesByRefs: mockGetEntitiesByRefs,
  validateEntity: mockValidateEntity,
  addLocation: mockAddLocation,
} as unknown as CatalogClient;

const configuration = new ConfigReader({});

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: configuration,
      permissions: permissionEvaluator,
      discovery: mockDiscovery,
      catalogApi: mockCatalogClient,
      identity: mockIdentityClient,
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /ping', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/ping');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /repositories', () => {
    it('returns 200 when repositories are fetched without errors', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);

      jest
        .spyOn(GithubApiService.prototype, 'getRepositoriesFromIntegrations')
        .mockResolvedValue({
          repositories: [
            {
              name: 'A',
              full_name: 'my-ent-org-1/A',
              url: 'https://api.github.com/repos/my-ent-org-1/A',
              html_url: 'https://github.com/my-ent-org-1/A',
              default_branch: 'master',
            },
            {
              name: 'B',
              full_name: 'my-ent-org-1/B',
              url: 'https://api.github.com/repos/my-ent-org-1/B',
              html_url: 'https://github.com/my-ent-org-1/B',
              default_branch: 'main',
            },
          ],
          errors: [],
        });
      jest
        .spyOn(GithubApiService.prototype, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(CatalogInfoGenerator.prototype, 'listCatalogUrlLocations')
        .mockResolvedValue([]);

      const response = await request(app).get('/repositories');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        repositories: [
          {
            id: 'my-ent-org-1/A',
            name: 'A',
            organization: 'my-ent-org-1',
            url: 'https://github.com/my-ent-org-1/A',
            importStatus: null,
            errors: [],
            defaultBranch: 'master',
          },
          {
            id: 'my-ent-org-1/B',
            name: 'B',
            organization: 'my-ent-org-1',
            url: 'https://github.com/my-ent-org-1/B',
            importStatus: null,
            errors: [],
            defaultBranch: 'main',
          },
        ],
      });
    });

    it('returns 200 with the errors in the body when repositories are fetched, but errors have occurred', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);

      const githubApiServiceResponse: GithubRepositoryResponse = {
        repositories: [
          {
            name: 'A',
            full_name: 'backstage/A',
            url: 'https://api.github.com/repos/backstage/A',
            html_url: 'https://github.com/backstage/A',
            default_branch: 'master',
          },
          {
            name: 'B',
            full_name: 'backstage/B',
            url: 'https://api.github.com/repos/backstage/B',
            html_url: 'https://github.com/backstage/B',
            default_branch: 'main',
          },
        ],
        errors: [
          {
            error: {
              name: 'customError',
              message: 'Github App with ID 2 failed spectacularly',
            },
            type: 'app',
            appId: 2,
          },
        ],
      };
      jest
        .spyOn(GithubApiService.prototype, 'getRepositoriesFromIntegrations')
        .mockResolvedValue(githubApiServiceResponse);
      jest
        .spyOn(GithubApiService.prototype, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(CatalogInfoGenerator.prototype, 'listCatalogUrlLocations')
        .mockResolvedValue([]);

      const response = await request(app).get('/repositories');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: ['Github App with ID 2 failed spectacularly'],
        repositories: [
          {
            defaultBranch: 'master',
            errors: [],
            id: 'backstage/A',
            importStatus: null,
            name: 'A',
            organization: 'backstage',
            url: 'https://github.com/backstage/A',
          },
          {
            defaultBranch: 'main',
            errors: [],
            id: 'backstage/B',
            importStatus: null,
            name: 'B',
            organization: 'backstage',
            url: 'https://github.com/backstage/B',
          },
        ],
      });
    });

    it('returns 500 when one or more errors are returned with no successful repository fetches', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);

      jest
        .spyOn(GithubApiService.prototype, 'getRepositoriesFromIntegrations')
        .mockResolvedValue({
          repositories: [],
          errors: [
            {
              error: {
                name: 'some error',
                message: 'Github App with ID 1234567890 returned an error',
              },
              type: 'app',
              appId: 2,
            },
          ],
        });
      jest
        .spyOn(GithubApiService.prototype, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(CatalogInfoGenerator.prototype, 'listCatalogUrlLocations')
        .mockResolvedValue([]);

      const response = await request(app).get('/repositories');

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({
        errors: ['Github App with ID 1234567890 returned an error'],
      });
    });
  });
});
