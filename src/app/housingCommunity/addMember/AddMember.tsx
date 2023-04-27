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
import { MobileDatePicker } from '@mui/x-date-pickers';

import { useMembers } from '../../../hooks/useMembers/useMembers';
import { useUnits } from '../../../hooks/useUnits/useUnits';

import { useStyles } from './AddMember.styles';
import { AddMemberForm, AddMemberProps } from './AddMember.types';
import { addMemberFormDefaultValues } from './AddMember.constants';

export const AddMember: React.FC<AddMemberProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const { fetchAll: fetchAllMembers } = useMembers();
  const { fetchAll: fetchAllUnits } = useUnits();

  const { control, handleSubmit } = useForm<AddMemberForm>({
    defaultValues: addMemberFormDefaultValues,
  });

  const onSubmit = async (data: AddMemberForm) => {
    // TODO: remove!
    console.log({ data });

    await fetchAllMembers();
    await fetchAllUnits();
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6">Dodaj nowego właściciela</Typography>

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

        <Controller
          control={control}
          name={'share'}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Udział we własności"
              margin="normal"
              type={'number'}
              variant="outlined"
            />
          )}
        />

        <Box mt={2} mb={2}>
          <Typography>Okres własności:</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
            <Box>
              <Typography>od dnia:</Typography>
              <MobileDatePicker />
            </Box>
            <Box>
              <Typography>do dnia:</Typography>
              <MobileDatePicker />
            </Box>
          </Box>
        </Box>

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
    </Box>
  );
};
