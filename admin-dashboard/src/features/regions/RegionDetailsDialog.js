import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { useTranslation } from 'react-i18next';

const RegionDetailsDialog = ({ open, onClose, onSave, regionData, allUsers }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3388ff');
  const [assignedUser, setAssignedUser] = useState('');

  useEffect(() => {
    if (regionData) {
      setName(regionData.name || '');
      setColor(regionData.color || '#3388ff');
      setAssignedUser(regionData.assigned_user_id || '');
    } else {
      setName('');
      setColor('#3388ff');
      setAssignedUser('');
    }
  }, [regionData]);

  const handleSave = () => {
    onSave({
      ...regionData,
      name,
      color,
      assigned_user_id: assignedUser,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('regions.regionDetails')}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={t('regions.regionName')}
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('regions.color')}
          </Typography>
          <HexColorPicker color={color} onChange={setColor} style={{ width: '100%' }} />
          <TextField
            margin="dense"
            id="color-hex"
            label={t('regions.hexColor')}
            type="text"
            fullWidth
            variant="outlined"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            sx={{ mt: 1 }}
          />
        </Box>
        <Box>
          <FormControl fullWidth margin="dense">
            <InputLabel id="assigned-user-label">{t('regions.assignedUser')}</InputLabel>
            <Select
              labelId="assigned-user-label"
              id="assigned-user-select"
              value={assignedUser}
              label={t('regions.assignedUser')}
              onChange={(e) => setAssignedUser(e.target.value)}
            >
              <MenuItem value="">{t('regions.unassigned')}</MenuItem>
              {allUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username || user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSave} variant="contained">{t('common.save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegionDetailsDialog;
