'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';
import { MobileDatePicker } from '@mui/x-date-pickers';

import { HousingCommunity } from '../HousingCommunity';

import { AddUnitForm, AddUnitProps } from './AddUnit.types';
import { addUnitFormDefaultValues } from './AddUnit.constants';

import { useMembers } from '@/hooks/useMembers/useMembers';
// eslint-disable-next-line import/extensions
import { Member } from '@/hooks/useMembers/useMembers.types';

export const AddUnit: React.FC<AddUnitProps> = ({}) => {
  const { members: membersAll } = useMembers();

  const [member, setMember] = useState('');

  const { control, handleSubmit, setValue, watch, register } = useForm<AddUnitForm>({
    defaultValues: addUnitFormDefaultValues,
  });

  register('members');

  const isKdr = watch('isKdr');

  const onSubmit = async (data: AddUnitForm) => {
    // TODO: remove!
    console.log('AddUnit - onSubmit:', { data });
  };

  const handleMemberSelectValueChange = (event: SelectChangeEvent<string>) => {
    setMember(event.target.value as string);
  };

  const handleAddMemberButtonClick = () => {
    // TODO: remove!
    console.log('AddUnit - handleAddMemberButtonClick:', { data: watch() });

    const newMember = {
      member: membersAll.find((member) => member.memberId === watch('member')) as Member,
      memberFrom: watch('memberFrom'),
      memberTo: watch('memberTo'),
      share: watch('share'),
    };

    const newMembers = [...watch('members'), newMember];

    // TODO: remove!
    console.log('AddUnit - handleAddMemberButtonClick:', { newMember, newMembers });

    setValue('members', newMembers);

    setMember('');
  };

  useEffect(() => {
    if (!isKdr) {
      setValue('kdrFrom', '');
      setValue('kdrTo', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKdr]);

  useEffect(() => {
    console.log('AddUnit:', { membersAll });
  }, [membersAll]);

  useEffect(() => {
    setValue('member', member);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  return (
    <HousingCommunity>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6">Nowy lokal</Typography>

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

        <FormControlLabel
          control={
            <Controller
              control={control}
              name={'isKdr'}
              render={({ field }) => <Checkbox {...field} color="primary" />}
            />
          }
          label={'Karta Dużej Rodziny'}
        />

        {watch('isKdr') && (
          <Box sx={{ pl: 1 }}>
            <Typography>KDR w okresie:</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
              <Box>
                <Typography>od dnia:</Typography>

                <Controller
                  control={control}
                  name="kdrFrom"
                  render={({ field: { name, value, ...field } }) => (
                    <MobileDatePicker
                      {...field}
                      value={value ? new Date(value) : null}
                      onChange={(data) =>
                        setValue(name, data ? data.toISOString() : '', {
                          shouldDirty: true,
                          shouldTouch: true,
                        })
                      }
                    />
                  )}
                />
              </Box>

              <Box>
                <Typography>do dnia:</Typography>

                <Controller
                  control={control}
                  name="kdrTo"
                  render={({ field: { name, value, ...field } }) => (
                    <MobileDatePicker
                      {...field}
                      value={value ? new Date(value) : null}
                      onChange={(data) =>
                        setValue(name, data ? data.toISOString() : '', {
                          shouldDirty: true,
                          shouldTouch: true,
                        })
                      }
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ mb: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Właściciele
        </Typography>

        <Box sx={{ px: 2 }}>
          <FormControl fullWidth>
            <Select value={member} onChange={handleMemberSelectValueChange}>
              {membersAll.map((member) => (
                <MenuItem key={member.memberId} value={member.memberId}>
                  {`${member.lastName}, ${member.firstName}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {member && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography>Okres własności:</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                <Box>
                  <Typography>od dnia:</Typography>

                  <Controller
                    control={control}
                    name="memberFrom"
                    render={({ field: { name, value, ...field } }) => (
                      <MobileDatePicker
                        {...field}
                        value={value ? new Date(value) : null}
                        onChange={(data) =>
                          setValue(name, data ? data.toISOString() : '', {
                            shouldDirty: true,
                            shouldTouch: true,
                          })
                        }
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Typography>do dnia:</Typography>

                  <Controller
                    control={control}
                    name="memberTo"
                    render={({ field: { name, value, ...field } }) => (
                      <MobileDatePicker
                        {...field}
                        value={value ? new Date(value) : null}
                        onChange={(data) =>
                          setValue(name, data ? data.toISOString() : '', {
                            shouldDirty: true,
                            shouldTouch: true,
                          })
                        }
                      />
                    )}
                  />
                </Box>
              </Box>

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

              <Button
                variant="contained"
                color="primary"
                type="button"
                onClick={handleAddMemberButtonClick}
              >
                Dodaj właściciela
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 4 }} />

        <Button variant="contained" color="primary" type="submit">
          Dodaj lokal
        </Button>
      </form>

      <DevTool control={control} />
    </HousingCommunity>
  );
};
