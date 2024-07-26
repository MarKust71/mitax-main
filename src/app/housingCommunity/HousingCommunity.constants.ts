import { MainRoutes } from '../../routing/MainRouter.constants';

import { NavItemRoute } from './HousingCommunity.types';

export const memberData = {
  firstName: 'Katarzyna',
  lastName: 'Ryszkiewicz',
  email: 'marek.kustosz@gmail.com',
  phone: '+48600414149',
  address: {
    name: 'Marek Kustosz',
    street: 'Rymarska 45/3',
    city: 'Wrocław',
    zip: '53-206',
    state: 'PL',
  },
};

export const unitData = {
  unitNumber: 8,
  members: [
    {
      memberFrom: '2021-09-01',
      memberTo: null,
      member: memberData,
    },
  ],
  isCommercial: false,
};

export const navItems: NavItemRoute[] = [
  {
    label: 'Start',
    route: MainRoutes.HOUSING_COMMUNITY,
  },
  {
    label: 'Operacje',
    route: MainRoutes.HOUSING_COMMUNITY,
  },
  {
    label: 'Administracja',
  },
];

export const navSubItems: { [key: string]: NavItemRoute[] } = {
  Administracja: [
    {
      label: 'Właściciele',
      route: MainRoutes.HC_MEMBERS,
    },
    {
      label: 'Lokale',
      route: MainRoutes.HC_UNITS,
    },
  ],
};

export const drawerWidth = 240;

export const container = window !== undefined ? () => window.document.body : undefined;

export const appTitle = 'Wspólnota 1.0';
