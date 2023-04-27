import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  IconButton,
  TextField,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import { useUnits } from '../../hooks/useUnits/useUnits';
import { useMembers } from '../../hooks/useMembers/useMembers';

import { HousingCommunityProps } from './HousingCommunity.types';
import { useStyles } from './HousingCommunity.styles';
import { appTitle, navItems } from './HousingCommunity.constants';
import { HousingCommunityDrawer } from './housingCommunityDrawer/HousingCommunityDrawer';

export const HousingCommunity: React.FC<HousingCommunityProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  const { fetchAll: fetchAllMembers } = useMembers();
  const { fetchAll: fetchAllUnits } = useUnits();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [unitNumber, setUnitNumber] = useState('');
  const [isCommercial, setIsCommercial] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleSubmit = async () => {
    await fetchAllMembers();
    await fetchAllUnits();
  };

  return (
    <Container>
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            {appTitle}
          </Typography>

          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item} sx={{ color: '#fff' }}>
                {item}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav">
        <HousingCommunityDrawer open={mobileOpen} onClose={handleDrawerToggle} />
      </Box>

      <Box component="main">
        <Toolbar />

        <Box mb={2} />

        <Box>
          <form onSubmit={handleSubmit}>
            <Typography variant="h6">Dodaj nowy lokal</Typography>

            <TextField
              fullWidth
              label="Numer lokalu"
              margin="normal"
              onChange={(e) => setUnitNumber(e.target.value)}
              value={unitNumber}
              variant="outlined"
            />

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isCommercial}
                    onChange={(e) => setIsCommercial(e.target.checked)}
                    color="primary"
                  />
                }
                label={'Lokal przeznaczony na działalność'}
              />
            </FormGroup>

            <Box mb={4} />

            <Button variant="contained" color="primary" type="submit">
              Zapisz
            </Button>
          </form>
        </Box>
      </Box>
    </Container>
  );
};
