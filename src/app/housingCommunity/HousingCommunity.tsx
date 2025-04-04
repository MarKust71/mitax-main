import React, { useState } from 'react';
import { AppBar, Box, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

import { HousingCommunityProps } from './HousingCommunity.types';
import { appTitle, navItems } from './HousingCommunity.constants';
import { HousingCommunityDrawer } from './housingCommunityDrawer/HousingCommunityDrawer';

export const HousingCommunity: React.FC<HousingCommunityProps> = ({ children }) => {
  const navigate = useNavigate();

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
              <Button
                key={item.label}
                sx={{ color: '#fff' }}
                onClick={item.route ? () => navigate(item.route as string) : undefined}
              >
                {item.label}
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

      {children}
    </Container>
  );
};
