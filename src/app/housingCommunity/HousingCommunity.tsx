import React, { useContext } from 'react';
import { Button, useTheme } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';

import { FirebaseContext } from '../../App';

import { HousingCommunityProps } from './HousingCommunity.types';
import { useStyles } from './HousingCommunity.styles';

export const HousingCommunity: React.FC<HousingCommunityProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  const { db } = useContext(FirebaseContext);

  const handleClick = async () => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        first: 'Ada',
        last: 'Lovelace',
        born: 1815,
      });
      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  return <Button onClick={handleClick}>HousingCommunity</Button>;
};
