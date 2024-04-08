import {
  createData,
  createOrganizationData,
} from '../../utils/repository-utils';

export const getDataForRepositories = () => [
  createData(1, 'Cupcake', 'https://github.com/cupcake', '', 'org/cupcake', 3),
  createData(2, 'Donut', 'https://github.com/donut', 'Done', 'org/donut'),
  createData(3, 'Eclair', 'https://github.com/eclair', '', 'org/eclair', 2),
  createData(
    4,
    'Frozen yoghurt',
    'https://github.com/yogurt',
    '',
    'org/desert',
    0,
  ),
  createData(
    5,
    'Gingerbread',
    'https://github.com/gingerbread',
    'Exists',
    'org/desert',
    0,
  ),
  createData(9, 'KitKat', 'https://github.com/kitkat', '', 'org/desert', 0),
  createData(13, 'Oreo', 'https://github.com/oreo', '', 'org/desert', 0),
  createData(
    10,
    'food-app',
    'https://github.com/food-app',
    'Progress',
    'org/pet-store-boston',
    0,
  ),
  createData(
    11,
    'online-store',
    'https://github.com/online-store',
    'Done',
    'org/pet-store-boston',
    0,
  ),
  createData(
    12,
    'pet-app',
    'https://github.com/pet-app',
    'Failed',
    'org/pet-store-boston',
    0,
  ),
];

export const getDataForOrganizations = () => [
  createOrganizationData(
    1,
    'org/pet-store-boston',
    'https://github.com/pet-store-boston',
    [
      {
        id: 10,
        name: 'food-app',
        url: 'https://github.com/food-app',
        organization: 'org/pet-store-boston',
        catalogInfoYaml: {
          status: 'Progress',
          yaml: '',
        },
      },
      {
        id: 11,
        name: 'online-store',
        url: 'https://github.com/online-store',
        organization: 'org/pet-store-boston',
        catalogInfoYaml: {
          status: 'Done',
          yaml: '',
        },
      },
      {
        id: 12,
        name: 'pet-app',
        url: 'https://github.com/pet-app',
        organization: 'org/pet-store-boston',
        catalogInfoYaml: {
          status: 'Failed',
          yaml: '',
        },
      },
    ],
  ),
  createOrganizationData(2, 'org/desert', 'https://github.com/desert', [
    {
      id: 1,
      name: 'Cupcake',
      url: 'https://github.com/cupcake',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: 'Progress',
        yaml: '',
      },
    },
    {
      id: 2,
      name: 'Donut',
      url: 'https://github.com/donut',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: 'Done',
        yaml: '',
      },
    },
    {
      id: 3,
      name: 'Eclair',
      url: 'https://github.com/eclair',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: 'Failed',
        yaml: '',
      },
    },
    {
      id: 4,
      name: 'Frozen yoghurt',
      url: 'https://github.com/yogurt',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: '',
        yaml: '',
      },
    },
    {
      id: 5,
      name: 'Gingerbread',
      url: 'https://github.com/gingerbread',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: 'Exists',
        yaml: '',
      },
    },
    {
      id: 9,
      name: 'KitKat',
      url: 'https://github.com/kitkat',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: 'Done',
        yaml: '',
      },
    },
    {
      id: 13,
      name: 'Oreo',
      url: 'https://github.com/oreo',
      organization: 'org/desert',
      catalogInfoYaml: {
        status: '',
        yaml: '',
      },
    },
  ]),
];
