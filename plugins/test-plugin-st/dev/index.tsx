import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import { plugin, PluginPage } from '../src/plugin';

const mockedDiscoveryApi = {
  getBaseUrl: async (_param: any) => {
    return 'http://localhost:7007/api/proxy';
  },
};

createDevApp()
  .registerPlugin(plugin)
  .addPage({
    element: 
    (
      <TestApiProvider
        apis={[
          [discoveryApiRef, mockedDiscoveryApi],
        ]}
      >
       <PluginPage />
      </TestApiProvider>
    ),
    title: 'test-plugin-st',
    path: '/test-plugin-st',
    icon: () => <PermIdentityOutlinedIcon />
  })
  .render();
