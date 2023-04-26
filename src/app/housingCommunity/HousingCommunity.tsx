import React, { useEffect } from 'react';
import { Button, useTheme } from '@mui/material';

import { useUnits } from '../../hooks/useUnits/useUnits';
import { useMembers } from '../../hooks/useMembers/useMembers';

import { HousingCommunityProps } from './HousingCommunity.types';
import { useStyles } from './HousingCommunity.styles';

export const HousingCommunity: React.FC<HousingCommunityProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  const { create: createMember, fetchAll, members } = useMembers();
  const { create: createUnit } = useUnits();

  const handleClick = async () => {
    const memberData = {
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

    const unitData = {
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

    // await createMember(memberData);

    // await createUnit(unitData);

    await fetchAll();
  };

  useEffect(() => {
    // TODO: remove!
    console.log({ members });
  }, [members]);

  return <Button onClick={handleClick}>HousingCommunity</Button>;
};
