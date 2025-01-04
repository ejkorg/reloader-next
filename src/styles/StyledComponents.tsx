import { styled } from '@mui/material/styles';
import { Box, TextField, Button, Typography } from '@mui/material';

export const StyledBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const StyledTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));