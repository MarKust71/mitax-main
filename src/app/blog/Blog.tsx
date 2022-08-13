import React from 'react';
import { useTheme } from '@mui/material';

import { BlogProps } from './Blog.types';
import { useStyles } from './Blog.styles';

export const Blog: React.FC<BlogProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  return <>Blog</>;
  };
