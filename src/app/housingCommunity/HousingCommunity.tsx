import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import { HousingCommunityProps } from './HousingCommunity.types';
import { useStyles } from './HousingCommunity.styles';
import { appTitle, navItems } from './HousingCommunity.constants';
import { HousingCommunityDrawer } from './housingCommunityDrawer/HousingCommunityDrawer';
import { AddMember } from './addMember/AddMember';

export const HousingCommunity: React.FC<HousingCommunityProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
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
      </Box>

      <AddMember />
    </Container>
  );
};
