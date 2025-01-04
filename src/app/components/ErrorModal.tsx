// filepath: /c:/Users/kate/Documents/project/reloader-nextjs/src/app/components/ErrorModal.tsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface ErrorModalProps {
  open: boolean;
  handleClose: () => void;
  errorMessage: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ open, handleClose, errorMessage }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Error</DialogTitle>
      <DialogContent>
        <DialogContentText>{errorMessage}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorModal;