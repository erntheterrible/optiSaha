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
  Chip,
  Box,
  OutlinedInput,
  Stack,
  InputAdornment,
  DialogContentText,
} from '@mui/material';
import { MuiColorInput } from 'mui-color-input';
import EditLocationIcon from '@mui/icons-material/EditLocation';
import TextFieldIcon from '@mui/icons-material/TextFields';
import DescriptionIcon from '@mui/icons-material/Description';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import GroupIcon from '@mui/icons-material/Group';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const RegionDetailsDialog = ({ open, onClose, onSave, regionData, allUsers = [] }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3388ff');
  const [assignedUsers, setAssignedUsers] = useState([]);

  useEffect(() => {
    if (open) { // Reset form only when dialog opens
      if (regionData) {
        setName(regionData.name || '');
        setDescription(regionData.description || '');
        setColor(regionData.color || '#3388ff');
        setAssignedUsers(regionData.assignedUsers || []);
      } else {
        setName('');
        setDescription('');
        setColor('#3388ff');
        setAssignedUsers([]);
      }
    }
  }, [regionData, open]);

  const handleSave = () => {
    onSave({
      ...regionData,
      name,
      description,
      color,
      assignedUsers,
    });
    onClose(); // Close dialog after save
  };

  const handleUserChange = (event) => {
    const { target: { value } } = event;
    setAssignedUsers(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
        <EditLocationIcon color="primary" />
        {regionData ? 'Edit Region Details' : 'Create New Region'}
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText sx={{ mb: 2, mt: 1 }}>
          {regionData ? 'Update the details for this region.' : 'Define the properties for the newly drawn area. Assign a name and color to easily identify it on the map.'}
        </DialogContentText>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            autoFocus
            required
            label="Region Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TextFieldIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Description"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionIcon />
                </InputAdornment>
              ),
            }}
          />
          <MuiColorInput
            label="Region Color"
            value={color}
            onChange={setColor}
            format="hex"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ColorLensIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth>
            <InputLabel id="assigned-users-label">Assign Users</InputLabel>
            <Select
              labelId="assigned-users-label"
              multiple
              value={assignedUsers}
              onChange={handleUserChange}
              input={<OutlinedInput startAdornment={<InputAdornment position="start"><GroupIcon /></InputAdornment>} id="select-multiple-chip" label="Assign Users" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((userId) => {
                    const user = allUsers.find(u => u.id === userId);
                    return <Chip key={userId} label={user ? user.username : '...'} />;
                  })}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {allUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={!name}>Save Region</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegionDetailsDialog;
