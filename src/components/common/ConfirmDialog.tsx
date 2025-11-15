import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmColor?: 'primary' | 'error';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmColor = 'primary',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: 'var(--dialog-bg)',
            borderRadius: 2,
            minWidth: 320,
            boxShadow: 'var(--shadow-lg)',
          },
        },
      }}
    >
      <DialogTitle sx={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500, pb: 1 }}>
        {title}
      </DialogTitle>
      {message && (
        <DialogContent>
          <Typography sx={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            {message}
          </Typography>
        </DialogContent>
      )}
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onCancel} sx={{ color: 'var(--text-tertiary)', textTransform: 'none' }}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          sx={{
            color: confirmColor === 'error' ? 'var(--accent-danger)' : 'var(--accent-primary)',
            textTransform: 'none',
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};



