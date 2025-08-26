import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemIcon, ListItemText, Checkbox } from '@mui/material';
import { Icon } from '@iconify/react';

// Example widget catalog (should match your dashboard widget keys)
const WIDGETS = [
  { key: 'kpi-total-sales', label: 'Total Sales', icon: 'mdi:cash' },
  { key: 'kpi-total-projects', label: 'Total Projects', icon: 'mdi:clipboard-list-outline' },
  { key: 'kpi-total-visits', label: 'Total Visits', icon: 'mdi:account-group-outline' },
  { key: 'kpi-avg-cost', label: 'Avg. Project Cost', icon: 'mdi:finance' },
  { key: 'kpi-success-rate', label: 'Target Success Rate', icon: 'mdi:target' },
  { key: 'chart-comparison', label: 'Comparison Chart', icon: 'mdi:chart-line' },
  { key: 'chart-annual-profits', label: 'Annual Profits', icon: 'mdi:chart-donut' },
  { key: 'chart-activity-manager', label: 'Activity Manager', icon: 'mdi:chart-areaspline' },
  { key: 'quick-actions-wallet', label: 'Wallet Verification', icon: 'mdi:wallet' },
  { key: 'chart-team-performance', label: 'Team Performance', icon: 'mdi:chart-bar' },
  { key: 'chart-device-distribution', label: 'Device Distribution', icon: 'mdi:devices' },
];

const WidgetSelectDialog = ({ open, onClose, onSelect, currentWidgets }) => {
  const [selected, setSelected] = React.useState([]);

  React.useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  const handleToggle = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleAdd = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Widgets to Add</DialogTitle>
      <DialogContent>
        <List>
          {WIDGETS.map((widget) => (
            <ListItem key={widget.key} button onClick={() => handleToggle(widget.key)}>
              <ListItemIcon>
                <Icon icon={widget.icon} width={24} height={24} />
              </ListItemIcon>
              <ListItemText primary={widget.label} />
              <Checkbox edge="end" checked={selected.includes(widget.key)} tabIndex={-1} disableRipple />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} disabled={selected.length === 0} variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WidgetSelectDialog;
