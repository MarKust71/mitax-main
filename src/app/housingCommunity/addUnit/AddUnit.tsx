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

import { AddUnitForm, AddUnitProps } from './AddUnit.types';
import { useStyles } from './AddUnit.styles';
import { addUnitFormDefaultValues } from './AddUnit.constants';

export const AddUnit: React.FC<AddUnitProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  const { control, handleSubmit } = useForm<AddUnitForm>({
    defaultValues: addUnitFormDefaultValues,
  });

  const onSubmit = async (data: AddUnitForm) => {
    // TODO: remove!
    console.log('AddUnit - onSubmit:', { data });
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6">Dodaj nowy lokal</Typography>

        <Controller
          control={control}
          name={'unitNumber'}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Numer lokalu"
              margin="normal"
              variant="outlined"
            />
          )}
        />

        <FormControlLabel
          control={
            <Controller
              control={control}
              name={'isCommercial'}
              render={({ field }) => <Checkbox {...field} color="primary" />}
            />
          }
          label={'Lokal przeznaczony na działalność'}
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
