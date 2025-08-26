import React, { useRef, useEffect, useState } from 'react';
import { Switch, FormControlLabel, Box, Drawer, CssBaseline, Toolbar, Typography, Divider, List, ListItem, ListItemButton, ListItemText, TextField, FormGroup, Paper } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import RegionDetailsDialog from './components/RegionDetailsDialog';
import { regionService } from '../../services/regionService';
import userService from '../../services/userService';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import LayersIcon from '@mui/icons-material/Layers';

import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issues with Leaflet and Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RegionsPage = () => {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showRegions, setShowRegions] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [isRegionDetailsDialogOpen, setIsRegionDetailsDialogOpen] = useState(false);
  const [currentRegionData, setCurrentRegionData] = useState(null);
  const [regions, setRegions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);


  const featureGroupRef = useRef();

  const filteredRegions = regions.filter(region => {
    const matchesSearchTerm = (
      region.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const createdAt = dayjs(region.created_at);
    const matchesStartDate = startDate ? createdAt.isAfter(startDate.startOf('day')) || createdAt.isSame(startDate.startOf('day')) : true;
    const matchesEndDate = endDate ? createdAt.isBefore(endDate.endOf('day')) || createdAt.isSame(endDate.endOf('day')) : true;

    const matchesUser = selectedUserId ? region.assigned_user_id === selectedUserId : true;

    return matchesSearchTerm && matchesStartDate && matchesEndDate && matchesUser;
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleHeatmapToggle = (event) => {
    setShowHeatmap(event.target.checked);
  };

  const handleRegionsToggle = (event) => {
    setShowRegions(event.target.checked);
  };

  const highlightRegion = (regionId) => {
    if (featureGroupRef.current) {
      featureGroupRef.current.eachLayer(layer => {
        if (layer.options.id === regionId) {
          if (layer instanceof L.Path) {
            layer.setStyle({ fillColor: 'yellow', fillOpacity: 0.7 });
          }
        }
      });
    }
  };

  const resetRegionHighlight = (regionId) => {
    if (featureGroupRef.current) {
      featureGroupRef.current.eachLayer(layer => {
        if (layer.options.id === regionId) {
          // Reset to original style or default style
          const originalRegion = regions.find(r => r.id === regionId);
          if (layer instanceof L.Path) {
            layer.setStyle({ fillColor: originalRegion?.color || '#3388ff', fillOpacity: 0.2 });
          }
        }
      });
    }
  };

  useEffect(() => {
    const renderRegions = () => {
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers(); // Clear all layers first

        if (showRegions) {
          filteredRegions.forEach(region => {
            const isHighlighted = selectedUserId && region.assigned_user_id === selectedUserId;
            const style = () => ({
              color: region.color || '#3388ff',
              weight: 3,
              opacity: 1,
              fillColor: isHighlighted ? 'yellow' : (region.color || '#3388ff'),
              fillOpacity: isHighlighted ? 0.7 : 0.2,
            });

            const geoJsonLayer = L.geoJSON(region.geometry, {
              style: style,
            });

            geoJsonLayer.eachLayer(layer => {
              // Attach necessary data and events to each individual layer
              layer.options.id = region.id;
              layer.on('click', () => {
                setCurrentRegionData(region);
                setIsRegionDetailsDialogOpen(true);
              });
              featureGroupRef.current.addLayer(layer);
            });
          });
        }
      }
    };

    renderRegions();
  }, [showRegions, filteredRegions, selectedUserId]); // Re-render when showRegions, regions, or selectedUserId change

  useEffect(() => {
    const fetchAndSetRegions = async () => {
      try {
        const fetchedRegions = await regionService.getRegions();
        setRegions(fetchedRegions);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };
    fetchAndSetRegions();
  }, []);

  const _onCreated = async (e) => {
    const { layerType, layer } = e;
    console.log('Created:', layerType, layer.toGeoJSON());
    // For new regions, open the dialog to get details
    setCurrentRegionData({
      shape_type: layerType,
      geometry: layer.toGeoJSON(),
      leaflet_id: layer._leaflet_id, // Store leaflet_id to associate with the dialog
    });
    setIsRegionDetailsDialogOpen(true);
  };

  const _onEdited = async (e) => {
    const { layers } = e;
    layers.eachLayer(async (layer) => {
      console.log('Edited:', layer.toGeoJSON());
      // Assuming the layer has an ID corresponding to a region in your state
      const regionId = layer.options.id; // Get the Supabase ID from the layer options
      if (regionId) {
        // Find the region in state to pre-fill dialog
        const existingRegion = regions.find(r => r.id === regionId);
        if (existingRegion) {
          setCurrentRegionData({
            ...existingRegion,
            leaflet_id: layer._leaflet_id, // Pass leaflet_id for later lookup
            geometry: layer.toGeoJSON(), // Pass updated geometry
          });
          setIsRegionDetailsDialogOpen(true);
        }
      }
    });
  };

  const _onDeleted = async (e) => {
    const { layers } = e;
    layers.eachLayer(async (layer) => {
      console.log('Deleted:', layer.toGeoJSON());
      const regionId = layer.options.id; // You'll need to set this when loading/creating
      if (regionId) {
        try {
          await regionService.deleteRegion(regionId);
          setRegions(prev => prev.filter(r => r.id !== regionId));
          console.log('Region deleted from DB:', regionId);
        } catch (error) {
          console.error('Error deleting region:', error);
        }
      }
    });
  };

  const initialPosition = [39.9334, 32.8597]; // Ankara, Turkey coordinates

  const drawerWidth = 300;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 112px)', width: '100%' }}>
      {/* Control Panel */}
      <Box 
        sx={{
          width: 300, 
          flexShrink: 0, 
          p: 2, 
          overflowY: 'auto', 
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Regions & Users
        </Typography>
        <Divider />
        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
          <List>
            {filteredRegions.map((region) => (
              <ListItem 
                key={region.id} 
                disablePadding 
                onMouseEnter={() => highlightRegion(region.id)}
                onMouseLeave={() => resetRegionHighlight(region.id)}
              >
                <ListItemButton>
                  <ListItemText primary={region.name} secondary={`ID: ${region.id}`} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        <Divider />
        <Box sx={{ pt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            User Filter
          </Typography>
          <FormGroup>
            <TextField
              select
              label="Filter by User"
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value)}
              SelectProps={{
                native: true,
              }}
              fullWidth
            >
              <option value="">All Users</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </TextField>
          </FormGroup>
        </Box>
      </Box>

      {/* Map Area */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', gap: 2, p: 2, alignItems: 'center', backgroundColor: 'background.paper', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <TextField 
            label="Search Regions by Name/ID" 
            variant="outlined" 
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              enableAccessibleFieldDOMStructure={false}
              slots={{ textField: (params) => <TextField {...params} size="small" sx={{ width: '150px' }} /> }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              enableAccessibleFieldDOMStructure={false}
              slots={{ textField: (params) => <TextField {...params} size="small" sx={{ width: '150px' }} /> }}
            />
          </LocalizationProvider>
        </Box>
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <MapContainer center={initialPosition} zoom={10} style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}>
            <Paper 
              elevation={4} 
              sx={{ 
                position: 'absolute', 
                bottom: 20, 
                left: 20, 
                zIndex: 1000,  
                p: 1, 
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <FormControlLabel
                control={<Switch checked={showHeatmap} onChange={handleHeatmapToggle} name="heatmapToggle" />}
                label={<Box component="span" sx={{ display: 'flex', alignItems: 'center' }}><ThermostatIcon sx={{ mr: 1 }} /> Show Heatmap</Box>}
              />
              <FormControlLabel
                control={<Switch checked={showRegions} onChange={handleRegionsToggle} name="regionsToggle" />}
                label={<Box component="span" sx={{ display: 'flex', alignItems: 'center' }}><LayersIcon sx={{ mr: 1 }} /> Show Regions</Box>}
              />
            </Paper>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {showRegions && (
              <FeatureGroup ref={featureGroupRef}>
                <EditControl
                  position="topright"
                  draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                  }}
                  onCreated={_onCreated}
                  onEdited={_onEdited}
                  onDeleted={_onDeleted}
                />
              </FeatureGroup>
            )}
          </MapContainer>
        </Box>
      </Box>
      <RegionDetailsDialog
        open={isRegionDetailsDialogOpen}
        onClose={() => setIsRegionDetailsDialogOpen(false)}
        onSave={async (updatedData) => {
          setIsRegionDetailsDialogOpen(false);
          if (updatedData.id) {
            // Existing region, update it
            try {
              const savedRegion = await regionService.updateRegion(
                updatedData.id,
                updatedData.name,
                updatedData.color,
                updatedData.assigned_user_id,
                updatedData.geometry,
                updatedData.shape_type
              );
              setRegions(prev => prev.map(r => r.id === savedRegion.id ? savedRegion : r));
              console.log('Region updated in DB:', savedRegion);
            } catch (error) {
              console.error('Error updating region:', error);
            }
          } else {
            // New region, create it
            try {
              const newRegion = await regionService.createRegion({
                name: updatedData.name,
                color: updatedData.color,
                geometry: updatedData.geometry,
                shape_type: updatedData.shape_type,
              });
              setRegions(prev => [...prev, newRegion]);

              // Find the Leaflet layer by its leaflet_id and set the Supabase ID
              if (featureGroupRef.current && updatedData.leaflet_id) {
                const layer = featureGroupRef.current.getLayer(updatedData.leaflet_id);
                if (layer) {
                  layer.options.id = newRegion.id; // Associate Supabase ID with Leaflet layer
                }
              }
            } catch (error) {
              console.error('Error creating region:', error);
            }
          }
        }}
        regionData={currentRegionData}
        allUsers={allUsers}
      />
    </Box>
  );
};

export default RegionsPage;
