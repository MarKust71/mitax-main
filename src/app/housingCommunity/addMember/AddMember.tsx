import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';

import { useMembers } from '../../../hooks/useMembers/useMembers';
import { CreateMemberDTO } from '../../../hooks/useMembers/useMembers.types';
import { HousingCommunity } from '../HousingCommunity';

import { useStyles } from './AddMember.styles';
import { AddMemberForm, AddMemberProps } from './AddMember.types';
import { addMemberFormDefaultValues } from './AddMember.constants';

export const AddMember: React.FC<AddMemberProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const { addMember } = useMembers();

  const { control, handleSubmit, setValue } = useForm<AddMemberForm>({
    defaultValues: addMemberFormDefaultValues,
  });

  const onSubmit = async (data: AddMemberForm) => {
    // TODO: remove!
    console.log('onSubmit:', { data });

    const addMemberData: CreateMemberDTO = {
      address: data.address,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    };

    // TODO: remove!
    console.log('onSubmit:', { addMemberData });

    const result = await addMember(addMemberData);

    // TODO: remove!
    console.log('onSubmit:', { result });
  };

  return (
    <HousingCommunity>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6">Nowy właściciel</Typography>

        <Controller
          control={control}
          name={'lastName'}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Nazwisko" margin="normal" variant="outlined" />
          )}
        />

        <Controller
          control={control}
          name={'firstName'}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Imię" margin="normal" variant="outlined" />
          )}
        />

        <Controller
          control={control}
          name={'phone'}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Telefon" margin="normal" variant="outlined" />
          )}
        />

        <Controller
          control={control}
          name={'email'}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Email" margin="normal" variant="outlined" />
          )}
        />

        <FormControlLabel
          control={
            <Controller
              control={control}
              name={'isAddress'}
              render={({ field }) => <Checkbox {...field} color="primary" />}
            />
          }
          label={'Inny adres do korespondencji'}
        />

        <Box mb={4} />

        <Button variant="contained" color="primary" type="submit">
          Dodaj
        </Button>
      </form>

      <DevTool control={control} />
    </HousingCommunity>
  );
};
