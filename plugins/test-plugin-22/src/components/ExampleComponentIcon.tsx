import React from 'react';

import { SidebarItem } from '@backstage/core-components';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import { IconComponent } from '@backstage/core-plugin-api';


export const ExampleComponentIcon = () => {

  return (
    <SidebarItem text="test-plugin-22" to="/test-plugin-22" icon={PermIdentityOutlinedIcon as IconComponent} />
  );
};
