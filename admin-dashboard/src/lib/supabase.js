import React, { useState, useEffect, useMemo, useCallback, createContext, Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from './theme';
import Box from '@mui/material/Box';
import UserForm from './components/UserForm';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapIcon from '@mui/icons-material/Map';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Login from './Login';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart as ReBarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ReferenceLine } from 'recharts';
import ReportsList from './components/ReportsList';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import { MapContainer, TileLayer, Marker, Popup, Polygon, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.heat';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/Download';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import ListSubheader from '@mui/material/ListSubheader';
import Divider from '@mui/material/Divider';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import ReportIcon from '@mui/icons-material/PictureAsPdf';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PrivacyTipOutlinedIcon from '@mui/icons-material/PrivacyTipOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import LanguageSelector from './components/LanguageSelector';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from '@mui/icons-material/Person';

// Theme Context for dark mode
export const ThemeContext = createContext();

// Custom hook to use theme context
export const useThemeContext = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Design tokens for light and dark themes
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light' ? {
      // Light theme colors
      primary: {
        main: '#2563EB',
        light: '#3B82F6',
        dark: '#1D4ED8',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#7C3AED',
        light: '#8B5CF6',
        dark: '#6D28D9',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#F9FAFB',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#111827',
        secondary: '#4B5563',
        disabled: '#9CA3AF',
      },
      divider: 'rgba(0, 0, 0, 0.12)',
    } : {
      // Dark theme colors
      primary: {
        main: '#60A5FA',
        light: '#93C5FD',
        dark: '#3B82F6',
        contrastText: '#111827',
      },
      secondary: {
        main: '#A78BFA',
        light: '#C4B5FD',
        dark: '#8B5CF6',
        contrastText: '#111827',
      },
      background: {
        default: '#0F172A',
        paper: '#1E293B',
      },
      text: {
        primary: '#F8FAFC',
        secondary: '#E2E8F0',
        disabled: '#94A3B8',
      },
      divider: 'rgba(255, 255, 255, 0.12)',
    }),
    // Common colors for both themes
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#111827',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1.125rem', fontWeight: 600 },
    subtitle1: { fontSize: '1rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
    body1: { fontSize: '0.9375rem', fontWeight: 400 },
    body2: { fontSize: '0.875rem', fontWeight: 400 },
    button: { textTransform: 'none', fontWeight: 500 },
    caption: { fontSize: '0.75rem', fontWeight: 400 },
    overline: { fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'light' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'light' 
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E293B',
          color: mode === 'light' ? '#111827' : '#F8FAFC',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderBottom: mode === 'light' 
            ? '1px solid rgba(0, 0, 0, 0.05)' 
            : '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E293B',
          borderRight: mode === 'light' 
            ? '1px solid rgba(0, 0, 0, 0.05)' 
            : '1px solid rgba(255, 255, 255, 0.08)',
          boxSizing: 'border-box',
          width: drawerWidth,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? '#9CA3AF' : '#64748B',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? '#2563EB' : '#60A5FA',
            borderWidth: 1,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: mode === 'light' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(96, 165, 250, 0.1)',
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(96, 165, 250, 0.15)',
            },
          },
          '&:hover': {
            backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
  },
});

const drawerWidth = 220;

// Re-add the visitColumns definition
const visitColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'username', headerName: 'Kullanıcı', width: 130 },
  { field: 'visit_type', headerName: 'Ziyaret Türü', width: 130 },
  { field: 'description', headerName: 'Açıklama', width: 200 },
  { field: 'timestamp', headerName: 'Tarih', width: 180 },
  { field: 'is_auto_detected', headerName: 'Otomatik', width: 120, type: 'boolean' },
];

// Re-add the projectColumns definition
const projectColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'proje_adi', headerName: 'Proje Adı', width: 200 },
  { field: 'musteri_adi', headerName: 'Müşteri', width: 150 },
  { field: 'durum', headerName: 'Durum', width: 120 },
  { field: 'tutar', headerName: 'Tutar', width: 120 },
  { field: 'olusturma_tarihi', headerName: 'Oluşturma Tarihi', width: 180 },
];

// Re-add the userColumns definition
const userColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'username', headerName: 'Kullanıcı Adı', width: 150 },
  { field: 'full_name', headerName: 'Ad Soyad', width: 180 },
  { field: 'email', headerName: 'Email', width: 220 },
  { field: 'rol', headerName: 'Rol', width: 120 },
  { field: 'disabled', headerName: 'Pasif', width: 100, type: 'boolean' },
];

const COLORS = ['#FF5722', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#8BC34A'];

const menuItems = [
  { text: 'Ana Sayfa', icon: <DashboardIcon />, tabIndex: 0 },
  { text: 'Harita Yönetimi', icon: <MapIcon />, tabIndex: 1 },
  { text: 'Ziyaretler', icon: <AssignmentIcon />, tabIndex: 2 },
  { text: 'Projeler', icon: <BarChartIcon />, tabIndex: 3 },
  { text: 'Kullanıcılar', icon: <PeopleIcon />, tabIndex: 4 },
  { text: 'Bölgeler', icon: <MapIcon />, tabIndex: 5 },
  { text: 'Raporlar', icon: <InsertChartIcon />, tabIndex: 6 },
];

const bottomMenuItems = [
    { text: 'Ayarlar', icon: <SettingsIcon />, tabIndex: 7 },
    { text: 'Destek', icon: <HelpOutlineIcon />, tabIndex: 8 },
];

const theme = createTheme(getDesignTokens('light'));

function RegionsMap({ onLogout }) {
  const [regions, setRegions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);
  const [newPolygon, setNewPolygon] = React.useState(null);
  const [regionName, setRegionName] = React.useState('');
  const [assignedUser, setAssignedUser] = React.useState('');
  const [users, setUsers] = React.useState([]);
  const [heatmapData, setHeatmapData] = React.useState([]);
  const [heatmapLoading, setHeatmapLoading] = React.useState(false);
  const [selectedRegion, setSelectedRegion] = React.useState(null);
  const [mapInstance, setMapInstance] = React.useState(null);
  const [heatmapLayer, setHeatmapLayer] = React.useState(null);
  const [mapType, setMapType] = React.useState('regions');

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    setError('');
    axios.get('http://localhost:8000/api/regions', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setRegions(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Oturum süresi doldu veya yetkiniz yok.');
        onLogout();
      });
    // Kullanıcıları çek
    axios.get('http://localhost:8000/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setUsers(res.data))
      .catch(() => {});
  }, [onLogout]);

  // Harita merkezini seçili bölgeye veya Türkiye'ye ayarla
  const center = selectedRegion && selectedRegion.coordinates && selectedRegion.coordinates.length > 0
    ? [selectedRegion.coordinates[0].latitude, selectedRegion.coordinates[0].longitude]
    : regions.length > 0 && regions[0].coordinates && regions[0].coordinates.length > 0
      ? [regions[0].coordinates[0].latitude, regions[0].coordinates[0].longitude]
      : [39.0, 35.0];

  // Heatmap verilerini yükle
  const loadHeatmapData = React.useCallback(async (regionId = null) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setHeatmapLoading(true);
    try {
      const params = new URLSearchParams();
      if (regionId) params.append('region_id', regionId);
      
      const response = await axios.get(`http://localhost:8000/api/heatmap/data?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Keep the response data in object format for the HeatmapComponent
      setHeatmapData(response.data);
    } catch (err) {
      console.error('Error loading heatmap data:', err);
      setError('Isı haritası verileri yüklenirken bir hata oluştu.');
    } finally {
      setHeatmapLoading(false);
    }
  }, []);

  // Bölge seçildiğinde
  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    loadHeatmapData(region?.id || null);
  };

  // Custom Heatmap Component
  const HeatmapComponent = ({ heatmapData }) => {
    const map = useMap();
    
    React.useEffect(() => {
      if (!heatmapData || heatmapData.length === 0) return;
      
      // Convert data to leaflet.heat format with validation
      const heatPoints = heatmapData
        .filter(point => point && typeof point.lat === 'number' && typeof point.lng === 'number' && typeof point.intensity === 'number')
        .map(point => [
          point.lat,
          point.lng,
          point.intensity
        ]);
      
      // Only create heatmap if we have valid points
      if (heatPoints.length === 0) {
        console.warn('No valid heatmap points found');
        return;
      }
      
      // Create heatmap layer with enhanced visibility
      const heatLayer = L.heatLayer(heatPoints, {
        radius: 35,
        blur: 20,
        maxZoom: 17,
        minOpacity: 0.4,
        gradient: {
          0.1: '#0066ff',
          0.2: '#00ccff', 
          0.4: '#00ff66',
          0.6: '#ffff00',
          0.8: '#ff6600',
          1.0: '#ff0000'
        }
      });
      
      // Add to map
      heatLayer.addTo(map);
      
      // Cleanup function
      return () => {
        if (map.hasLayer(heatLayer)) {
          map.removeLayer(heatLayer);
        }
      };
    }, [heatmapData, map]);
    
    return null;
  };

  // Bileşen yüklendiğinde ve bölgeler değiştiğinde ısı haritasını yükle
  React.useEffect(() => {
    if (regions.length > 0) {
      // Varsayılan olarak ilk bölgeyi seç
      handleRegionSelect(regions[0]);
      // Heatmap'i otomatik yükle
      loadHeatmapData(regions[0]?.id || null);
    }
  }, [regions, loadHeatmapData]);

  // Harita örneği oluşturulduğunda
  const handleMapCreated = (map) => {
    setMapInstance(map);
  };

  // Isı haritası katmanını güncelle
  React.useEffect(() => {
    if (!mapInstance) return;
    
    // Önceki ısı haritası katmanını temizle
    if (heatmapLayer) {
      heatmapLayer.remove();
    }
    
    if (heatmapData.length > 0) {
      // Yeni ısı haritası katmanı oluştur
      const heatLayer = L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 0.5,
        gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'}
      }).addTo(mapInstance);
      
      setHeatmapLayer(heatLayer);
    }
    
    return () => {
      if (heatmapLayer) {
        heatmapLayer.remove();
      }
    };
  }, [heatmapData, mapInstance]);

  // Polygon çizildiğinde
  const handleCreated = (e) => {
    const latlngs = e.layer.getLatLngs()[0].map(latlng => ({ latitude: latlng.lat, longitude: latlng.lng }));
    setNewPolygon(latlngs);
    setOpenDialog(true);
  };

  // Polygon kaydet
  const handleSaveRegion = () => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:8000/api/regions', {
      name: regionName,
      coordinates: newPolygon,
      assigned_user_id: assignedUser || null,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setOpenDialog(false);
        setRegionName('');
        setAssignedUser('');
        setNewPolygon(null);
        // Refresh regions
        return axios.get('http://localhost:8000/api/regions', {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then(res => setRegions(res.data))
      .catch(() => setError('Bölge kaydedilemedi.'));
  };

  // Polygon silme
  const handleDeleted = (e) => {
    const token = localStorage.getItem('token');
    e.layers.eachLayer(layer => {
      const latlngs = layer.getLatLngs()[0].map(latlng => ({ latitude: latlng.lat, longitude: latlng.lng }));
      // En yakın bölgeyi bul
      const region = regions.find(r => JSON.stringify(r.coordinates) === JSON.stringify(latlngs));
      if (region) {
        axios.delete(`http://localhost:8000/api/regions/${region.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(() => setRegions(regions.filter(r => r.id !== region.id)))
          .catch(() => setError('Bölge silinemedi.'));
      }
    });
  };

  // Polygon düzenleme (yalnızca koordinat güncelleme)
  const handleEdited = (e) => {
    const token = localStorage.getItem('token');
    e.layers.eachLayer(layer => {
      const latlngs = layer.getLatLngs()[0].map(latlng => ({ latitude: latlng.lat, longitude: latlng.lng }));
      // En yakın bölgeyi bul
      const region = regions.find(r => r.name === layer.options.name);
      if (region) {
        axios.put(`http://localhost:8000/api/regions/${region.id}`, {
          ...region,
          coordinates: latlngs,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(() => {
            // Refresh regions
            return axios.get('http://localhost:8000/api/regions', {
              headers: { Authorization: `Bearer ${token}` },
            });
          })
          .then(res => setRegions(res.data))
          .catch(() => setError('Bölge güncellenemedi.'));
      }
    });
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Harita seçici ve kontroller */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'background.paper', borderRadius: 2, mb: 2, boxShadow: 1 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Harita Türü</InputLabel>
          <Select
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
            label="Harita Türü"
          >
            <MenuItem value="regions">Bölge Haritası</MenuItem>
            <MenuItem value="heatmap">Isı Haritası</MenuItem>
          </Select>
        </FormControl>
        
        {mapType === 'regions' && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Bölge Seçin</InputLabel>
            <Select
              value={selectedRegion?.id || ''}
              onChange={(e) => {
                const region = regions.find(r => r.id === e.target.value);
                handleRegionSelect(region || null);
              }}
              label="Bölge Seçin"
            >
              <MenuItem value="">Tüm Bölgeler</MenuItem>
              {regions.map(region => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        
        {mapType === 'heatmap' && (
          <>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Bölge Filtresi</InputLabel>
              <Select
                value={selectedRegion?.id || ''}
                onChange={(e) => {
                  const region = regions.find(r => r.id === e.target.value);
                  handleRegionSelect(region || null);
                  loadHeatmapData(region?.id || null);
                }}
                label="Bölge Filtresi"
              >
                <MenuItem value="">Tüm Bölgeler</MenuItem>
                {regions.map(region => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              onClick={() => loadHeatmapData(selectedRegion?.id || null)}
              disabled={heatmapLoading}
              startIcon={heatmapLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
            >
              {heatmapLoading ? 'Yükleniyor...' : 'Isı Haritasını Yükle'}
            </Button>
          </>
        )}
      </Box>
      
      {/* Harita konteyneri */}
      <Box sx={{ flex: 1, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
        {heatmapLoading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }}>
            <CircularProgress />
          </Box>
        )}
        
        <MapContainer 
          center={center} 
          zoom={selectedRegion ? 12 : 10}
          style={{ height: '100%', width: '100%', minHeight: '500px' }}
          whenCreated={handleMapCreated}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          
          {/* Conditional rendering based on map type */}
          {mapType === 'heatmap' && heatmapData.length > 0 && (
            <HeatmapComponent heatmapData={heatmapData} />
          )}
          
          {mapType === 'regions' && (
            <FeatureGroup>
              <EditControl
                position="topright"
                onCreated={handleCreated}
                onDeleted={handleDeleted}
                onEdited={handleEdited}
                draw={{ rectangle: false, circle: false, marker: false, polyline: false, circlemarker: false }}
              />
            
            {regions.map((region, idx) => (
              <Polygon
                key={region.id}
                positions={region.coordinates.map(c => [c.latitude, c.longitude])}
                pathOptions={{ 
                  color: COLORS[idx % COLORS.length], 
                  fillOpacity: selectedRegion?.id === region.id ? 0.6 : 0.3,
                  weight: selectedRegion?.id === region.id ? 3 : 2,
                }}
                eventHandlers={{
                  click: () => handleRegionSelect(region)
                }}
              >
                <Popup>
                  <Typography variant="subtitle2" color="primary">{region.name}</Typography>
                  <Typography variant="body2">ID: {region.id}</Typography>
                  <Typography variant="body2">
                    Atanan: {users.find(u => u.id === region.assigned_user_id)?.full_name || 'Atanmamış'}
                  </Typography>
                </Popup>
              </Polygon>
            ))}
            </FeatureGroup>
          )}
        </MapContainer>
      </Box>
      {/* Yeni bölge ekleme dialogu */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Yeni Bölge Ekle</DialogTitle>
        <DialogContent>
          <TextField
            label="Bölge Adı"
            value={regionName}
            onChange={e => setRegionName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Select
            value={assignedUser}
            onChange={e => setAssignedUser(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">Kullanıcı Atama (isteğe bağlı)</MenuItem>
            {users.map(u => (
              <MenuItem key={u.id} value={u.id}>{u.full_name || u.username}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button onClick={handleSaveRegion} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
    </Box>
  );
}

function App() {
  const [mode, setMode] = useState('light');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Initialize i18n with saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    } else {
      // Default to English if no language preference is set
      i18n.changeLanguage('en');
    }
  }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    console.log('Initializing theme...');
    // Check for saved theme first
    const savedTheme = localStorage.getItem('theme');
    console.log('Saved theme from localStorage:', savedTheme);
    
    // If no saved theme, check system preference
    if (!savedTheme) {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      console.log('No saved theme, using system preference:', initialTheme);
      setMode(initialTheme);
      localStorage.setItem('theme', initialTheme);
    } else {
      // Use saved theme
      console.log('Using saved theme:', savedTheme);
      setMode(savedTheme);
    }
  }, []);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    console.log('Toggle theme called. Current mode:', mode);
    setMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      console.log('Setting new theme mode:', newMode);
      localStorage.setItem('theme', newMode);
      return newMode;
    });
  }, [mode]);

  // Theme context value
  const themeContextValue = useMemo(() => ({
    mode,
    toggleTheme,
  }), [mode, toggleTheme]);

  // Create the theme based on the current mode
  const theme = useMemo(() => {
    console.log('Creating theme with mode:', mode);
    return createAppTheme(mode);
  }, [mode]);

  // Apply theme class to the root element
  useEffect(() => {
    console.log('Applying theme to root element. Mode:', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeContext.Provider value={themeContextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <Suspense fallback={<div>Loading...</div>}>
            <AppContent />
          </Suspense>
        </ThemeProvider>
      </ThemeContext.Provider>
    </I18nextProvider>
  );
}

export default App;
