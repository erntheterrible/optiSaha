import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polygon, 
  useMap, 
  Circle,
  FeatureGroup 
} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Map as MapIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import databaseService from '../../services/databaseService';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const RegionsPage = () => {
  const { t } = useTranslation();
  const [regions, setRegions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState('polygon');
  const [newRegion, setNewRegion] = useState({
    name: '',
    description: '',
    color: '#3f51b5',
    coordinates: [],
    assignedTo: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [mapCenter] = useState([40.7128, -74.0060]);
  const [mapZoom] = useState(13);
  const [activeTab, setActiveTab] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const mapRef = useRef();
  const featureGroupRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [regionsData, usersData] = await Promise.all([
          databaseService.getRegions(),
          databaseService.getUsers(),
        ]);
        setRegions(regionsData);
        setUsers(usersData);
      } catch (err) {
        console.error(err);
        setError(t('regions.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreated = useCallback((e) => {
    const { layerType, layer } = e;
    
    if (layerType === 'polygon' || layerType === 'rectangle' || layerType === 'circle') {
      let coordinates;
      
      if (layerType === 'circle') {
        const center = layer.getLatLng();
        const radius = layer.getRadius();
        coordinates = [[center.lat, center.lng], radius];
      } else {
        coordinates = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
      }
      
      setNewRegion(prev => ({
        ...prev,
        type: layerType,
        coordinates,
      }));
      
      if (featureGroupRef.current) {
        featureGroupRef.current.removeLayer(layer);
      }
      
      setOpenDialog(true);
    }
  }, []);

  const startDrawing = (mode) => {
    setDrawMode(mode);
    setNewRegion({
      name: '',
      description: '',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      coordinates: [],
      assignedTo: '',
    });
    setIsDrawing(true);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setNewRegion({
      name: '',
      description: '',
      color: '#3f51b5',
      coordinates: [],
      assignedTo: '',
    });
  };

  const saveRegion = async () => {
    try {
      const savedRegion = await databaseService.createRegion(newRegion);
      setRegions([...regions, savedRegion]);
      setIsDrawing(false);
      setNewRegion({
        name: '',
        description: '',
        color: '#3f51b5',
        coordinates: [],
        assignedTo: '',
      });
    } catch (error) {
      console.error('Failed to save region:', error);
      alert(t('regions.errors.saveFailed'));
    }
  };

  const handleSaveRegion = async () => {
    if (!selectedRegion) return;
    try {
      const updatedRegion = await databaseService.updateRegion(selectedRegion.id, selectedRegion);
      setRegions(regions.map(r => r.id === selectedRegion.id ? updatedRegion : r));
      setSelectedRegion(null);
    } catch (error) {
      console.error('Failed to update region:', error);
      alert(t('regions.errors.updateFailed'));
    }
  };

  const handleDeleteRegion = async (id) => {
    if (window.confirm(t('regions.confirmDelete'))) {
      try {
        await databaseService.deleteRegion(id);
        setRegions(regions.filter(region => region.id !== id));
        setSelectedRegion(null);
      } catch (error) {
        console.error('Failed to delete region:', error);
        alert(t('regions.errors.deleteFailed'));
      }
    }
  };

  const toggleRegionStatus = (id) => {
    setRegions(regions.map(region => 
      region.id === id 
        ? { ...region, status: region.status === 'active' ? 'inactive' : 'active' } 
        : region
    ));
  };

  const renderRegionList = () => (
    <Box>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('common.search')}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>
      <List sx={{ overflowY: 'auto', height: 'calc(100vh - 200px)' }}>
        {regions.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('regions.noRegionsFound')}
            </Typography>
          </Box>
        ) : (
          regions.map((region) => {
            const assignedUser = users.find(u => u.id === region.assignedTo);
            return (
              <React.Fragment key={region.id}>
                <ListItem 
                  button 
                  selected={selectedRegion?.id === region.id}
                  onClick={() => {
                    setSelectedRegion(region);
                    setOpenDialog(true);
                  }}
                >
                  <Box sx={{ width: 16, height: 16, bgcolor: region.color, mr: 1.5, borderRadius: '2px' }} />
                  <ListItemText 
                    primary={region.name} 
                    secondary={
                      <>
                        {assignedUser && (
                          <Box component="span" display="flex" alignItems="center" mt={0.5}>
                            <PersonIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                            <Typography variant="caption">{assignedUser.name}</Typography>
                          </Box>
                        )}
                        <Typography variant="caption" display="block">
                          {new Date(region.updatedAt).toLocaleDateString()}
                        </Typography>
                      </>
                    } 
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={t(`regions.status.${region.status}`)} 
                      size="small"
                      color={region.status === 'active' ? 'success' : 'default'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRegionStatus(region.id);
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            );
          })
        )}
      </List>
    </Box>
  );

  const renderDrawingTools = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {t('regions.drawTools')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <Button
          variant={drawMode === 'polygon' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => startDrawing('polygon')}
          disabled={isDrawing}
        >
          {t('regions.drawPolygon')}
        </Button>
        <Button
          variant={drawMode === 'rectangle' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => startDrawing('rectangle')}
          disabled={isDrawing}
        >
          {t('regions.drawRectangle')}
        </Button>
        <Button
          variant={drawMode === 'circle' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => startDrawing('circle')}
          disabled={isDrawing}
        >
          {t('regions.drawCircle')}
        </Button>
      </Box>
      {isDrawing && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('regions.drawingInstructions')}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedRegion(null);
    setNewRegion({
      name: '',
      description: '',
      color: '#3f51b5',
      coordinates: [],
      assignedTo: '',
    });
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <Paper sx={{ width: 350, display: 'flex', flexDirection: 'column' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<MapIcon />} label={t('menu.regions')} />
          <Tab icon={<LayersIcon />} label={t('regions.layers')} />
        </Tabs>
        
        {activeTab === 0 ? renderRegionList() : renderDrawingTools()}
        
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedRegion(null);
              setOpenDialog(true);
            }}
          >
            {t('regions.addRegion')}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          whenCreated={mapInstance => { 
            mapRef.current = mapInstance;
            const drawControl = new L.Control.Draw({
              position: 'topleft',
              draw: {
                polygon: {
                  allowIntersection: false,
                  drawError: {
                    color: '#e1e100',
                    message: '<strong>Hata:<strong> Çizim geçerli değil!'
                  },
                  shapeOptions: {
                    color: '#3f51b5',
                    fillOpacity: 0.2,
                    weight: 2
                  },
                  showArea: true
                },
                polyline: false,
                rectangle: {
                  shapeOptions: {
                    color: '#3f51b5',
                    fillOpacity: 0.2,
                    weight: 2
                  }
                },
                circle: {
                  shapeOptions: {
                    color: '#3f51b5',
                    fillOpacity: 0.2,
                    weight: 2
                  }
                },
                marker: false,
                circlemarker: false
              },
              edit: false
            });
            
            mapInstance.addControl(drawControl);
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topleft"
              onCreated={handleCreated}
              draw={{
                polygon: drawMode === 'polygon',
                rectangle: drawMode === 'rectangle',
                circle: drawMode === 'circle',
                marker: false,
                polyline: false,
                circlemarker: false
              }}
            />
          </FeatureGroup>
          
          {regions.map(region => {
            const assignedUser = users.find(u => u.id === region.assignedTo);
            
            if (region.type === 'circle') {
              const [center, radius] = region.coordinates;
              return (
                <Circle
                  key={region.id}
                  center={center}
                  radius={radius}
                  pathOptions={{
                    color: region.status === 'active' ? region.color : '#999',
                    fillOpacity: region.status === 'active' ? 0.2 : 0.1,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedRegion(region);
                      setOpenDialog(true);
                    }
                  }}
                >
                  <Popup>
                    <div>
                      <strong>{region.name}</strong><br />
                      {region.description && <>{region.description}<br /></>}
                      {assignedUser && <><PersonIcon fontSize="small" /> {assignedUser.name}<br /></>}
                      <small>{t('common.clickToEdit')}</small>
                    </div>
                  </Popup>
                </Circle>
              );
            }
            
            return (
              <Polygon
                key={region.id}
                positions={region.coordinates}
                pathOptions={{
                  color: region.status === 'active' ? region.color : '#999',
                  fillOpacity: region.status === 'active' ? 0.2 : 0.1,
                  weight: 2
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedRegion(region);
                    setOpenDialog(true);
                  }
                }}
              >
                <Popup>
                  <div>
                    <strong>{region.name}</strong><br />
                    {region.description && <>{region.description}<br /></>}
                    {assignedUser && <><PersonIcon fontSize="small" /> {assignedUser.name}<br /></>}
                    <small>{t('common.clickToEdit')}</small>
                  </div>
                </Popup>
              </Polygon>
            );
          })}
          
          {showHeatmap && (
            <TileLayer
              url="https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHER_API_KEY"
              attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
            />
          )}
        </MapContainer>
        
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
          <Paper elevation={3} sx={{ p: 1, mb: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showHeatmap}
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={t('regions.showHeatmap')}
                labelPlacement="start"
                sx={{ m: 0, whiteSpace: 'nowrap' }}
              />
          </Paper>
        </Box>
        
        {isDrawing && (
          <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveRegion}
              disabled={newRegion.coordinates.length < 3}
            >
              {t('regions.saveRegion')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={cancelDrawing}
            >
              {t('actions.cancel')}
            </Button>
            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>{t('regions.colorLabel')}</Typography>
              <input 
                type="color" 
                value={newRegion.color} 
                onChange={(e) => setNewRegion({...newRegion, color: e.target.value})}
                style={{ width: 30, height: 30, padding: 0, border: 'none', background: 'none' }}
              />
            </Box>
          </Box>
        )}
      </Box>

      <Dialog 
        open={!!selectedRegion && !isDrawing} 
        onClose={() => setSelectedRegion(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedRegion?.name || t('regions.detailsTitle')}
          <Chip 
            label={t(selectedRegion?.status === 'active' ? 'regions.status.active' : 'regions.status.inactive')} 
            color={selectedRegion?.status === 'active' ? 'success' : 'default'}
            size="small"
            sx={{ ml: 2 }}
            onClick={() => selectedRegion && toggleRegionStatus(selectedRegion.id)}
          />
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('regions.nameLabel')}
            fullWidth
            variant="outlined"
            value={selectedRegion?.name || ''}
            onChange={(e) => setSelectedRegion({...selectedRegion, name: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('regions.descriptionLabel')}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={selectedRegion?.description || ''}
            onChange={(e) => setSelectedRegion({...selectedRegion, description: e.target.value})}
          />
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>{t('regions.colorLabel')}</Typography>
            <input 
              type="color" 
              value={selectedRegion?.color || '#3f51b5'} 
              onChange={(e) => setSelectedRegion({...selectedRegion, color: e.target.value})}
              style={{ width: 40, height: 40, padding: 0, border: 'none', background: 'none' }}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">{t('regions.coordinatesLabel')}</Typography>
            <Box sx={{ maxHeight: 150, overflowY: 'auto', p: 1, bgcolor: 'action.hover', borderRadius: 1, mt: 1 }}>
              {selectedRegion?.coordinates?.map((coord, idx) => (
                <Typography key={idx} variant="caption" component="div">
                  {`${idx + 1}. ${coord[0].toFixed(6)}, ${coord[1].toFixed(6)}`}
                </Typography>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => selectedRegion && handleDeleteRegion(selectedRegion.id)}
            color="error"
            startIcon={<DeleteIcon />}
          >
            {t('actions.delete')}
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button 
            onClick={() => setSelectedRegion(null)}
            color="inherit"
          >
            {t('actions.cancel')}
          </Button>
          <Button 
            onClick={handleSaveRegion}
            color="primary"
            variant="contained"
          >
            {t('actions.saveChanges')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegionsPage;
