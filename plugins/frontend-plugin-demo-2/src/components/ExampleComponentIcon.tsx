import React from 'react';

import { SidebarItem } from '@backstage/core-components';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import { IconComponent } from '@backstage/core-plugin-api';


export const ExampleComponentIcon = () => {

  return (
    <SidebarItem text="frontend-plugin-demo-2" to="/frontend-plugin-demo-2" icon={PermIdentityOutlinedIcon as IconComponent} />
  );
};
