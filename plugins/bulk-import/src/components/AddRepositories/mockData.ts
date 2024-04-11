import {
  createData,
  createOrganizationData,
} from '../../utils/repository-utils';

export const getDataForRepositories = () => [
  createData(1, 'Cupcake', 'https://github.com/cupcake', '', 'org/desert'),
  createData(2, 'Donut', 'https://github.com/donut', 'Done', 'org/desert'),
  createData(3, 'Eclair', 'https://github.com/eclair', '', 'org/desert'),
  createData(
    4,
    'Frozen yoghurt',
    'https://github.com/yogurt',
    '',
    'org/desert',
  ),
  createData(
    5,
    'Gingerbread',
    'https://github.com/gingerbread',
    'Exists',
    'org/desert',
  ),
  createData(6, 'KitKat', 'https://github.com/kitkat', '', 'org/desert'),
  createData(7, 'Oreo', 'https://github.com/oreo', '', 'org/desert'),
  createData(8, 'food-app', 'https://github.com/food-app', '', 'org/food'),
  createData(
    9,
    'online-store',
    'https://github.com/online-store',
    '',
    'org/pet-store-boston',
  ),
  createData(
    10,
    'pet-app',
    'https://github.com/pet-app',
    '',
    'org/pet-store-boston',
  ),
];

export const getDataForOrganizations = () =>
  createOrganizationData([
    {
      id: 1,
      repoName: 'Cupcake',
      repoUrl: 'https://github.com/cupcake',
      organizationUrl: 'org/desert',
      catalogInfoYaml: {
        status: '',
        prTemplate: {
          componentName: 'Cupcake',
          entityOwner: '',
          prTitle: 'This is the pull request title',
          prDescription: 'This is the description of the pull request',
          useCodeOwnersFile: false,
          yaml: {
            kind: 'Component',
            apiVersion: 'v1',
            metadata: { name: 'Cupcake' },
          },
        },
      },
    },
    {
      id: 2,
      repoName: 'Donut',
      repoUrl: 'https://github.com/donut',
      organizationUrl: 'org/desert',
      catalogInfoYaml: {
        status: '',
        prTemplate: {
          componentName: 'Donut',
          entityOwner: '',
          prTitle: 'This is the pull request title',
          prDescription: 'This is the description of the pull request',
          useCodeOwnersFile: false,
          yaml: {
            kind: 'Component',
            apiVersion: 'v1',
            metadata: { name: 'Donut' },
          },
        },
      },
    },
    {
      id: 3,
      repoName: 'Eclair',
      repoUrl: 'https://github.com/eclair',
      organizationUrl: 'org/desert',
      catalogInfoYaml: {
        status: '',
        prTemplate: {
          componentName: 'Eclair',
          entityOwner: '',
          prTitle: 'This is the pull request title',
          prDescription: 'This is the description of the pull request',
          useCodeOwnersFile: false,
          yaml: {
            kind: 'Component',
            apiVersion: 'v1',
            metadata: { name: 'Eclair' },
          },
        },
      },
    },
    {
      id: 4,
      repoName: 'Frozen yoghurt',
      repoUrl: 'https://github.com/yogurt',
      organizationUrl: 'org/desert',
      catalogInfoYaml: {
        status: '',
        prTemplate: {
          componentName: 'Frozen yogurt',
          entityOwner: '',
          prTitle: 'This is the pull request title',
          prDescription: 'This is the description of the pull request',
          useCodeOwnersFile: false,
          yaml: {
            kind: 'Component',
            apiVersion: 'v1',
            metadata: { name: 'Frozen Yogurt' },
          },
        },
      },
    },
    {
      id: 5,
      repoName: 'Gingerbread',
      repoUrl: 'https://github.com/gingerbread',
      organizationUrl: 'org/desert',
      catalogInfoYaml: {
        status: 'Exists',
        prTemplate: {
          componentName: 'Gingerbread',
          entityOwner: '',
          prTitle: 'This is the pull request title',
          prDescription: 'This is the description of the pull request',
          useCodeOwnersFile: false,
          yaml: {
            kind: 'Component',
            apiVersion: 'v1',
            metadata: { name: 'Gingerbread' },
          },
        },
      },
    },
    {
      id: 6,
      repoName: 'KitKat',
      repoUrl: 'https://github.com/kitkat',
      organizationUrl: 'org/desert',
      catalogInfoYaml: {
        status: 'Done',
        prTemplate: {
          componentName: 'KitKat',
          entityOwner: '',
          prTitle: 'This is the pull request title',
          prDescription: 'This is the description of the pull request',
          useCodeOwnersFile: false,
          yaml: {
            kind: 'Component',
            apiVersion: 'v1',
            metadata: { name: 'KitKat' },
          },
        },
      },
    },
    {
      id: 7,
      repoName: 'Oreo',
      repoUrl: 'https://github.com/oreo',
      organizationUrl: 'org/desert',
      catalogInfoYaml: {
        status: '',
        prTemplate: {
          componentName: 'Oreo',
          entityOwner: '',
          prTitle: 'This is the pull request title',
          prDescription: 'This is the description of the pull request',
          useCodeOwnersFile: false,
          yaml: {
            kind: 'Component',
            apiVersion: 'v1',
            metadata: { name: 'Oreo' },
          },
        },
      },
    },
    {
      id: 8,
      repoName: 'food-app',
      repoUrl: 'https://github.com/food-app',
      organizationUrl: 'org/food',
      catalogInfoYaml: {
        status: '',
        prTemplate: {
          componentName: 'food-app',
          entityOwner: '',
          prTitle: 'This is the pull request title',
          prDescription: 'This is the description of the pull request',
          useCodeOwnersFile: false,
          yaml: {
            kind: 'Component',
            apiVersion: 'v1',
            metadata: { name: 'food-app' },
          },
        },
      },
    },
    {
      id: 9,
      repoName: 'online-store',
      repoUrl: 'https://github.com/online-store',
      organizationUrl: 'org/pet-store-boston',
      catalogInfoYaml: {
        status: '',
        prTemplate: {
          componentName: 'online-store',
          entityOwner: '',
          prTitle: 'This is the pull request title',
          prDescription: 'This is the description of the pull request',
          useCodeOwnersFile: false,
          yaml: {
            kind: 'Component',
            apiVersion: 'v1',
            metadata: { name: 'online-store' },
          },
        },
      },
    },
    {
      id: 10,
      repoName: 'pet-app',
      repoUrl: 'https://github.com/pet-app',
      organizationUrl: 'org/pet-store-boston',
      catalogInfoYaml: {
        status: '',
        prTemplate: {
          componentName: 'pet-app',
          entityOwner: '',
          prTitle: 'This is the pull request title',
          prDescription: 'This is the description of the pull request',
          useCodeOwnersFile: false,
          yaml: {
            kind: 'Component',
            apiVersion: 'v1',
            metadata: { name: 'pet-app' },
          },
        },
      },
    },
  ]);