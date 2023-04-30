import React, { useEffect } from 'react';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { appTitle, navItems, navSubItems } from '../../HousingCommunity.constants';

import { HousingCommunityDrawerContentProps } from './HousingCommunityDrawerContent.types';
import { useStyles } from './HousingCommunityDrawerContent.styles';

export const HousingCommunityDrawerContent: React.FC<HousingCommunityDrawerContentProps> = ({
  onClick,
}) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const navigate = useNavigate();

  const [isSubItemOpen, setIsSubItemOpen] = React.useState<{ [key: string]: boolean }>({});

  const toggleSubItem = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, item: string) => {
    event.stopPropagation();
    setIsSubItemOpen((prevState) => ({
      ...prevState,
      [item]: !prevState[item],
    }));
  };

  useEffect(() => {
    Object.keys(navSubItems).forEach((item) => {
      setIsSubItemOpen((prevState) => ({
        ...prevState,
        [item]: false,
      }));
    });
  }, []);

  return (
    <Box onClick={onClick} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        {appTitle}
      </Typography>

      <Divider />

      <List component="div">
        {navItems.map((item) => {
          if (!Object.keys(navSubItems).includes(item.label)) {
            return (
              <ListItem
                key={item.label}
                disablePadding
                onClick={item.route ? () => navigate(item.route as string) : undefined}
              >
                <ListItemButton>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            );
          }

          if (Object.keys(navSubItems).includes(item.label)) {
            return (
              <>
                <ListItem
                  key={item.label}
                  disablePadding
                  onClick={(event) => toggleSubItem(event, item.label)}
                >
                  <ListItemButton>
                    <ListItemText primary={item.label} />

                    <ListItemIcon>
                      {isSubItemOpen[item.label] ? <ExpandMore /> : <ExpandLess />}
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>

                {isSubItemOpen[item.label] && (
                  <ListItem>
                    <List>
                      {navSubItems[item.label].map((subItem) => (
                        <ListItem
                          key={`${subItem.label}${subItem.label}`}
                          disablePadding
                          onClick={
                            subItem.route ? () => navigate(subItem.route as string) : undefined
                          }
                        >
                          <ListItemButton>
                            <ListItemText primary={subItem.label} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </ListItem>
                )}
              </>
            );
          }
        })}
      </List>
    </Box>
  );
};
