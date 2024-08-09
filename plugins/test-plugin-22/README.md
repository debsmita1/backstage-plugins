# test-plugin-22

Welcome to the test-plugin-22 plugin!

_This plugin was created through the Software Template_

## Getting started

1. Go to the plugin directory and run `yarn install`


### To access the plugin in isolation:

1. Go to the plugin directory

2. Run `yarn start`

This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.


### To access it from the Root of your backstage directory:


1. Add the package in the `packages/app/package.json`

  ```
  "@janus-idp/backstage-plugin-test-plugin-22": "^0.1.0",
  ```


2. Add Route in `packages/app/src/App.tsx`:

  ```tsx title="packages/app/src/App.tsx"
   /* highlight-add-next-line */
   import { PluginPage } from '@janus-idp/backstage-plugin-test-plugin-22';

   <Route path="/test-plugin-22" element={<PluginPage />} />
   ```

3. Add your plugin as a Sidebar Item in `packages/app/src/components/Root/Root.tsx`:

  ```tsx title="packages/app/src/components/Root/Root.tsx"
   /* highlight-add-next-line */
   import { PluginIcon } from '@janus-idp/backstage-plugin-test-plugin-22';

   export const Root = ({ children }: PropsWithChildren<{}>) => (
    <SidebarPage>
      <Sidebar>
        ...
        <SidebarItem
          icon={PluginIcon as IconComponent}
          to="test-plugin-22"
          text="test-plugin-22"
        />
        ...
      <Sidebar>
    </SidebarPage>
   );
  ```

4. Set-up the Backstage Proxy. Follow https://backstage.io/docs/integrations/github/locations#token-scopes for creating personal access token

  ```yaml title="app-config.yaml"
  proxy:
  ...
  '/github':
      target: 'https://api.github.com'
      headers:
          Authorization: 'token ${GITHUB_TOKEN}' 
  ```

5. Start your application from the root directory, and then navigate to [/test-plugin-22](http://localhost:3000/test-plugin-22).
