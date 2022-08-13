import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
}));
