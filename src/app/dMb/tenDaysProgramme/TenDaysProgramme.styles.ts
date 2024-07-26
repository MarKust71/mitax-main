import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    display: 'flex',
    flexDirection: 'column',
    marginTop: '24px',
    padding: '12px',
  },
}));
