import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Simple modal to display AI-generated meeting briefing.
 * @param {boolean} open   – modal visibility
 * @param {function} onClose – callback when closed
 * @param {string|null} summary – markdown / plaintext content from AI
 * @param {boolean} loading – show spinner while waiting
 */
export default function MeetingBriefingModal({ open, onClose, summary, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle component="div" sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography component="span" variant="h6" sx={{ flexGrow: 1 }}>
          Meeting Briefing
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ minHeight: 200 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }} variant="body2">
            {summary || 'No briefing available.'}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

MeetingBriefingModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  summary: PropTypes.string,
  loading: PropTypes.bool,
};

MeetingBriefingModal.defaultProps = {
  summary: '',
  loading: false,
};
