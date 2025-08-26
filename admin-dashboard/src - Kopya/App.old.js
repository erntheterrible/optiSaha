import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createAppTheme } from './theme';

// Components
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';

// API Service
import api from './services/api';

// Create a theme context
export const ThemeContext = React.createContext();

// Alert component for Snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Main App component
function App() {
  const [mode, setMode] = useState('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Theme setup
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Validate token and get user data
          const userData = await api.auth.me();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setSnackbar({
          open: true,
          message: 'Oturum doğrulanamadı. Lütfen tekrar giriş yapın.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    setMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newMode);
      return newMode;
    });
  }, []);

  // Handle login
  const handleLogin = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const { user: userData, token } = await api.auth.login(credentials);
      localStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);
      setSnackbar({
        open: true,
        message: 'Giriş başarılı!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Login failed:', error);
      setSnackbar({
        open: true,
        message: 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.',
        severity: 'error',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setSnackbar({
      open: true,
      message: 'Başarıyla çıkış yapıldı.',
      severity: 'success',
    });
  }, []);

  // Handle snackbar close
  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Theme context value
  const themeContextValue = useMemo(() => ({
    mode,
    toggleTheme,
  }), [mode, toggleTheme]);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {isAuthenticated ? (
          <DashboardLayout onLogout={handleLogout} user={user} />
              <Route 
                path="/reports" 
                element={
                  <Box sx={{ p: 3 }}>
                    <h1>Reports</h1>
                    {/* Add reports content here */}
                  </Box>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <Box sx={{ p: 3 }}>
                    <h1>Settings</h1>
                    {/* Add settings content here */}
                  </Box>
                } 
              />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </DashboardLayout>
        ) : (
          <Login onLogin={handleLogin} loading={loading} />
        )}
        
        {/* Global Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;

const drawerWidth = 220;

// Visit columns definition
const visitColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'project_name', headerName: 'Proje', width: 180 },
  { field: 'visit_date', headerName: 'Tarih', width: 120 },
  { field: 'status', headerName: 'Durum', width: 120 },
  { field: 'notes', headerName: 'Notlar', width: 200 },
  { field: 'is_auto_detected', headerName: 'Otomatik', width: 120, type: 'boolean' },
];

// Project columns definition
const projectColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'proje_adi', headerName: 'Proje Adı', width: 200 },
  { field: 'musteri_adi', headerName: 'Müşteri', width: 150 },
  { field: 'durum', headerName: 'Durum', width: 120 },
  { field: 'tutar', headerName: 'Tutar', width: 120 },
  { field: 'olusturma_tarihi', headerName: 'Oluşturma Tarihi', width: 180 },
];

// User columns definition - moved to DashboardLayout component

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

function UsersTable({ onLogout }) {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    setError('');
    axios.get('http://localhost:8000/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setRows(res.data.map(u => ({ ...u, id: u.id })));
        setLoading(false);
      })
      .catch(err => {
        setError('Oturum süresi doldu veya yetkiniz yok.');
        onLogout();
      });
  }, [onLogout]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'username', headerName: 'Kullanıcı Adı', width: 160 },
    { field: 'full_name', headerName: 'Ad Soyad', width: 180 },
    { field: 'email', headerName: 'E-posta', width: 200 },
    { field: 'rol', headerName: 'Rol', width: 120 },
    { field: 'disabled', headerName: 'Durum', width: 100, renderCell: (params) => params.value ? 'Pasif' : 'Aktif' },
    // CRUD için butonlar eklenebilir
  ];

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0 2px 12px 0 rgba(44, 102, 255, 0.10)', p: 3, minHeight: 320 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 700 }}>Users</Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        disableRowSelectionOnClick
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          border: 'none',
          '& .MuiDataGrid-cell': { borderBottom: '1px solid #333' },
          '& .MuiDataGrid-columnHeaders': { bgcolor: '#23242a', color: '#E0E0E0' },
          '& .MuiDataGrid-footerContainer': { bgcolor: '#23242a', color: '#E0E0E0' },
        }}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
      />
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      {/* CRUD işlemleri için butonlar ve dialoglar buraya eklenebilir */}
    </Box>
  );
}

function SettingsComponent() {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
        Ayarlar
      </Typography>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
            Tema
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Şu anki tema: <b>{mode === 'dark' ? 'Koyu' : 'Açık'}</b>
            </Typography>
            <Button variant="contained" color="primary" onClick={toggleTheme}>
              {mode === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
            Bildirimler
          </Typography>
          <Typography color="text.secondary">Bildirim ayarları yakında burada olacak.</Typography>
        </CardContent>
      </Card>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
            Hesap
          </Typography>
          <Typography color="text.secondary">Hesap ve gizlilik ayarları yakında burada olacak.</Typography>
        </CardContent>
      </Card>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
            Genel
          </Typography>
          <Typography color="text.secondary">Genel uygulama ayarları yakında burada olacak.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}


function UserDialog({ open, onClose, user, onSave }) {
  const [formData, setFormData] = React.useState({
    username: '',
    full_name: '',
    email: '',
    rol: '',
    disabled: false,
    password: ''
  });
  
  const [changePassword, setChangePassword] = React.useState(false);

  // Update form data when user prop changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        full_name: user.full_name || '',
        email: user.email || '',
        rol: user.rol || '',
        disabled: user.disabled || false,
        password: ''
      });
      setChangePassword(false);
    } else {
      setFormData({
        username: '',
        full_name: '',
        email: '',
        rol: '',
        disabled: false,
        password: ''
      });
      setChangePassword(true); // Show password field for new users
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.username) errors.push('Kullanıcı adı zorunludur');
    if (!formData.email) errors.push('E-posta zorunludur');
    if (!formData.rol) errors.push('Rol seçimi zorunludur');
    if ((!user?.id || changePassword) && !formData.password) {
      errors.push('Şifre zorunludur');
    }
    
    return errors;
  };

  const handleSave = () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      alert(`Lütfen aşağıdaki hataları düzeltin:\n\n${validationErrors.join('\n')}`);
      return;
    }
    
    // Only include password if it's a new user or password was changed
    const dataToSave = { ...formData };
    if (user?.id && !dataToSave.password) {
      delete dataToSave.password;
    }
    
    onSave(dataToSave);
  };

  const roles = ['Satış Mühendisi', 'Teknik Satış Mühendisi', 'Teknik Satış Sorumlusu', 'Satış Sorumlusu'];

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{user?.id ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" name="username" label="Username" type="text" fullWidth variant="outlined" value={formData.username || ''} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField margin="dense" name="full_name" label="Full Name" type="text" fullWidth variant="outlined" value={formData.full_name || ''} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField 
          margin="dense" 
          name="email" 
          label="Email" 
          type="email" 
          fullWidth 
          variant="outlined" 
          value={formData.email || ''} 
          onChange={handleChange} 
          sx={{ mb: 2 }} 
          required
        />
        {user?.id && (
          <FormControlLabel
            control={
              <Checkbox 
                checked={changePassword} 
                onChange={(e) => setChangePassword(e.target.checked)}
                sx={{ ml: 0.5 }}
              />
            }
            label="Change Password"
            sx={{ mb: 1, mt: 1, alignSelf: 'flex-start' }}
          />
        )}
        
        {(!user?.id || changePassword) && (
          <TextField 
            margin="dense" 
            name="password" 
            label={user?.id ? 'New Password' : 'Password*'} 
            type="password" 
            fullWidth 
            variant="outlined" 
            value={formData.password || ''}
            onChange={handleChange} 
            sx={{ mb: 2 }} 
            required={!user?.id}
            error={!user?.id && !formData.password}
            helperText={!user?.id && !formData.password ? 'Password is required' : ''}
          />
        )}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select name="rol" value={formData.rol || ''} label="Role" onChange={handleChange}>
            {roles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControlLabel control={<Checkbox name="disabled" checked={formData.disabled || false} onChange={handleChange} />} label="Disabled" />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}



// Project Categories Dialog
const ProjectCategoriesDialog = ({ 
  open, 
  onClose, 
  categories = [], 
  newCategory = '', 
  setNewCategory = () => {}, 
  onAddCategory = () => {},
  projects = [],
  onDeleteCategory = () => {}
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Proje Kategorileri</DialogTitle>
    <DialogContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Mevcut Kategoriler</Typography>
        <Box sx={{ mb: 2, maxHeight: 200, overflowY: 'auto', p: 1, border: '1px solid #E5E7EB', borderRadius: 1 }}>
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <Chip 
                key={index} 
                label={category} 
                onDelete={() => {
                  // Don't allow deleting if category is in use
                  const isInUse = projects.some(p => p.category === category);
                  if (isInUse) {
                    alert('Bu kategoride projeler bulunmaktadır. Önce bu kategorideki projeleri taşıyın veya silin.');
                    return;
                  }
                  onDeleteCategory(index);
                }}
                sx={{ m: 0.5 }}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">Henüz kategori eklenmemiş</Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Yeni kategori adı"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onAddCategory()}
        />
        <Button 
          variant="contained" 
          onClick={onAddCategory}
          disabled={!newCategory.trim()}
        >
          Ekle
        </Button>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Kapat</Button>
    </DialogActions>
  </Dialog>
);

// Add Project Dialog
const AddProjectDialog = ({ open, onClose, formData, onInputChange, onSubmit, categories = [] }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Yeni Proje Ekle</DialogTitle>
    <DialogContent>
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          name="name"
          label="Proje Adı *"
          fullWidth
          value={formData.name}
          onChange={onInputChange}
          required
        />
        <TextField
          name="description"
          label="Açıklama *"
          fullWidth
          multiline
          rows={3}
          value={formData.description}
          onChange={onInputChange}
          required
        />
        <FormControl fullWidth>
          <InputLabel>Kategori *</InputLabel>
          <Select
            name="category"
            value={formData.category}
            label="Kategori *"
            onChange={onInputChange}
            required
          >
            {categories.map((category, index) => (
              <MenuItem key={index} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            name="startDate"
            label="Başlangıç Tarihi"
            type="date"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            value={formData.startDate}
            onChange={onInputChange}
          />
          <TextField
            name="endDate"
            label="Bitiş Tarihi"
            type="date"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            value={formData.endDate}
            onChange={onInputChange}
          />
        </Box>
        <FormControl fullWidth>
          <InputLabel>Durum</InputLabel>
          <Select
            name="status"
            value={formData.status}
            label="Durum"
            onChange={onInputChange}
          >
            <MenuItem value="Aktif">Aktif</MenuItem>
            <MenuItem value="Beklemede">Beklemede</MenuItem>
            <MenuItem value="Tamamlandı">Tamamlandı</MenuItem>
            <MenuItem value="İptal">İptal</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>İptal</Button>
      <Button onClick={onSubmit} variant="contained" color="primary">
        Kaydet
      </Button>
    </DialogActions>
  </Dialog>
);

const DashboardLayout = ({ onLogout }) => {
  const [tab, setTab] = React.useState(0);
  const [kpis, setKpis] = React.useState(null);
  const [visits, setVisits] = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [regions, setRegions] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [userDialogOpen, setUserDialogOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [notifications, setNotifications] = React.useState([]);
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [addProjectOpen, setAddProjectOpen] = React.useState(false);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);
  const [reportEmail, setReportEmail] = React.useState('');
  const [reportFrequency, setReportFrequency] = React.useState('weekly');
  const [projectForm, setProjectForm] = React.useState({
    name: '',
    description: '',
    category: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Aktif'
  });
  const [categories, setCategories] = React.useState([
    'İnşaat',
    'Teknoloji',
    'Sağlık',
    'Eğitim',
    'Diğer'
  ]);
  const [newCategory, setNewCategory] = React.useState('');
  const [salesTrend, setSalesTrend] = React.useState([]);
  const [revenueDistribution, setRevenueDistribution] = React.useState([]);
  const [customerDist, setCustomerDist] = React.useState([
    { name: 'Products', value: 45, color: '#3B82F6' },
    { name: 'Services', value: 30, color: '#10B981' },
    { name: 'Consulting', value: 25, color: '#F59E0B' }
  ]);
  const [salespersonPerf, setSalespersonPerf] = React.useState([
    { name: 'Ali', value: 85 },
    { name: 'Ayşe', value: 92 },
    { name: 'Mehmet', value: 78 },
    { name: 'Fatma', value: 88 }
  ]);

  // Data fetching functions
  const fetchProjects = React.useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    axios.get('http://localhost:8000/api/projects', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    .then(res => setProjects(res.data))
    .catch(err => {
      console.error('Error fetching projects:', err);
      setError('Projeler yüklenirken bir hata oluştu');
      setProjects([]);
    });
  }, []);

  // Category related handlers
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory('');
    }
  };

  // Project related handlers
  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProject = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Basic validation
    if (!projectForm.name || !projectForm.description) {
      alert('Lütfen zorunlu alanları doldurunuz');
      return;
    }

    axios.post('http://localhost:8000/api/projects', projectForm, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      // Refresh projects list
      fetchProjects();
      setAddProjectOpen(false);
      setProjectForm({
        name: '',
        description: '',
        category: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'Aktif'
      });
    })
    .catch(error => {
      console.error('Error adding project:', error);
      alert('Proje eklenirken bir hata oluştu');
    });
  };

  // Report handlers
  const handleGenerateReport = (type = 'pdf') => {
    // Logic to call backend to generate and download a report
    console.log(`Generating ${type} report...`);
  };

  const handleScheduleReport = (reportEmail, reportFrequency) => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:8000/api/schedule-report', { email: reportEmail, interval: reportFrequency }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => alert('Report scheduled successfully!'))
      .catch(() => alert('Failed to schedule report.'));
  };

  const handleCancelSchedule = () => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:8000/api/cancel-scheduled-report', {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => alert('Report schedule cancelled.'))
      .catch(() => alert('Failed to cancel schedule.'));
  };
  
  // Data fetching functions
  const fetchUsers = React.useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get('http://localhost:8000/api/users', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    .then(res => setUsers(res.data))
    .catch(err => {
      console.error('Error fetching users:', err);
      setUsers([]);
    });
  }, []);

  const fetchReports = React.useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get('http://localhost:8000/api/reports', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    .then(res => setReports(res.data))
    .catch(err => {
      console.error('Error fetching reports:', err);
      setReports([]);
    });
  }, []);
  
  // Get theme context for dark mode functionality
  const themeContext = React.useContext(ThemeContext);
  const theme = useTheme();

  // Fetch current user data
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    axios.get('http://localhost:8000/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setCurrentUser(res.data);
    })
    .catch(err => {
      console.error('Error fetching user data:', err);
    });
  }, []);

  // Fetch all initial data
  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Fetch all data in parallel
        await Promise.all([
          fetchProjects(),
          fetchUsers(),
          fetchReports()
        ]);
        
        // Fetch dashboard data
        const [
          kpisResponse,
          salesTrendResponse,
          visitsResponse,
          projectsResponse,
          revenueDistributionResponse
        ] = await Promise.all([
          axios.get('http://localhost:8000/api/dashboard/kpis', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/api/dashboard/sales-trend', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/api/visits', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/api/projeler', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/api/dashboard/revenue-distribution', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        // Update state with responses
        setKpis(kpisResponse.data);
        setSalesTrend(salesTrendResponse.data);
        setVisits(visitsResponse.data);
        setProjects(projectsResponse.data);
        setRevenueDistribution(revenueDistributionResponse.data);
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [fetchProjects, fetchUsers, fetchReports]);
    };

  // Fetch all initial data
  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Fetch all data in parallel
        await Promise.all([
          fetchUsers(),
          fetchReports(),
          fetchProjects()
        ]);
        
        // Fetch dashboard data
        const [
          kpisRes,
          salesTrendRes,
          visitsRes,
          projectsRes,
          revenueDistributionRes
        ] = await Promise.all([
          axios.get('http://localhost:8000/api/dashboard/kpis', { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get('http://localhost:8000/api/dashboard/sales-trend', { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get('http://localhost:8000/api/visits', { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get('http://localhost:8000/api/projeler', { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get('http://localhost:8000/api/dashboard/revenue-distribution', { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ]);

        // Update state with responses
        setKpis(kpisRes.data);
        setSalesTrend(salesTrendRes.data);
        setVisits(visitsRes.data);
        setProjects(projectsRes.data);
        
        // Update revenue distribution with colors
        if (revenueDistributionRes.data) {
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];
          const distributionWithColors = revenueDistributionRes.data.map((item, index) => ({
            ...item,
            color: colors[index % colors.length]
          }));
          setRevenueDistribution(distributionWithColors);
        }
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Veriler yüklenirken bir hata oluştu');
        
        // Fallback to mock data if API fails
        setKpis({
          total_sales: 125000,
          total_projects: 42,
          total_visits: 187,
          target_ratio: 78
        });
        
        setSalesTrend(Array(12).fill(0).map((_, i) => ({
          date: `${i + 1}.Ay`,
          sales: Math.floor(Math.random() * 20000) + 5000
        })));
        
        setRevenueDistribution([
          { name: 'Ürünler', value: 45, color: '#3B82F6' },
          { name: 'Hizmetler', value: 30, color: '#10B981' },
          { name: 'Danışmanlık', value: 25, color: '#F59E0B' }
        ]);
        
        setSalespersonPerf([
          { name: 'Ali', value: 85 },
          { name: 'Ayşe', value: 92 },
          { name: 'Mehmet', value: 78 },
          { name: 'Fatma', value: 88 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [fetchUsers, fetchReports, fetchProjects]);

  const handleOpenUserDialog = (user = null) => {
    setCurrentUser(user || {
      username: '',
      full_name: '',
      email: '',
      rol: '',
      disabled: false
    });
    setUserDialogOpen(true);
  };

  const handleCloseUserDialog = () => {
    setCurrentUser(null);
    setUserDialogOpen(false);
  };

  const handleSaveUser = async (userData) => {
    const token = localStorage.getItem('token');
    const method = userData.id ? 'put' : 'post';
    const url = `http://localhost:8000/api/users${userData.id ? `/${userData.id}` : ''}`;
    
    console.log('Sending user data:', JSON.stringify(userData, null, 2));
    
    try {
      const response = await axios[method](url, userData, { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        } 
      });
      
      console.log('User saved successfully:', response.data);
      fetchUsers();
      setUserDialogOpen(false);
    } catch (err) {
      console.error("Failed to save user:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        request: err.request
      });
      
      let errorMessage = 'Kullanıcı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (err.response?.status === 422 && Array.isArray(err.response.data?.detail)) {
        // Handle validation errors (422 Unprocessable Entity)
        const errors = err.response.data.detail.map(e => {
          const field = e.loc ? e.loc[e.loc.length - 1] : 'field';
          return `- ${field}: ${e.msg || 'Invalid value'}`;
        }).join('\n');
        errorMessage = `Lütfen aşağıdaki hataları düzeltin:\n${errors}`;
      } else if (err.response?.data?.detail) {
        // Handle other error responses with detail
        errorMessage = `Hata: ${err.response.data.detail}`;
      } else if (err.response?.data) {
        // Handle other error responses
        errorMessage = `Hata: ${JSON.stringify(err.response.data)}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const token = localStorage.getItem('token');
      axios.delete(`http://localhost:8000/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => fetchUsers())
        .catch(err => console.error("Failed to delete user:", err));
    }
  };
  
  const userColumns = React.useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Kullanıcı Adı', width: 150 },
    { field: 'full_name', headerName: 'Ad Soyad', width: 180 },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'rol', headerName: 'Rol', width: 120 },
    { field: 'disabled', headerName: 'Pasif', width: 100, type: 'boolean' },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => handleOpenUserDialog(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteUser(params.row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    }
  ], [handleOpenUserDialog, handleDeleteUser]);

  const kpiList = kpis ? [
    { title: 'Toplam Satış (₺)', value: kpis.total_sales },
    { title: 'Toplam Proje', value: kpis.total_projects },
    { title: 'Toplam Ziyaret', value: kpis.total_visits },
    { title: 'Ortalama Proje Tutarı', value: kpis.avg_project_value },
  ] : [];

  const quickActions = [
      { 
        text: 'Yeni Proje Ekle', 
        icon: <AddCircleOutlineIcon />, 
        action: () => setAddProjectOpen(true) 
      },
      { 
        text: 'Ziyaret Ekle', 
        icon: <AssignmentIcon />,
        action: () => console.log('Log a Visit clicked')
      },
      { 
        text: 'Rapor Oluştur', 
        icon: <ReceiptLongIcon />,
        action: () => handleGenerateReport()
      },
      { 
        text: 'Kullanıcı Ekle', 
        icon: <PersonAddIcon />,
        action: () => handleOpenUserDialog()
      },
  ];

// Main Dashboard Layout - This is the main DashboardLayout component
  const [addProjectOpen, setAddProjectOpen] = React.useState(false);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);
  const [reportEmail, setReportEmail] = React.useState('');
  const [reportFrequency, setReportFrequency] = React.useState('weekly');
  const [projectForm, setProjectForm] = React.useState({
    name: '',
    description: '',
    category: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Aktif'
  });
  const [categories, setCategories] = React.useState([
    'İnşaat',
    'Teknoloji',
    'Sağlık',
    'Eğitim',
    'Diğer'
  ]);
  const [newCategory, setNewCategory] = React.useState('');
  const [salesTrend, setSalesTrend] = React.useState([]);
  const [revenueDistribution, setRevenueDistribution] = React.useState([]);
  const [customerDist, setCustomerDist] = React.useState([
    { name: 'Products', value: 45, color: '#3B82F6' },
    { name: 'Services', value: 30, color: '#10B981' },
    { name: 'Consulting', value: 25, color: '#F59E0B' }
  ]);
  const [salespersonPerf, setSalespersonPerf] = React.useState([
    { name: 'Ali', value: 85 },
    { name: 'Ayşe', value: 92 },
    { name: 'Mehmet', value: 78 },
    { name: 'Fatma', value: 88 }
  ]);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Data fetching functions
  const fetchProjects = React.useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    axios.get('http://localhost:8000/api/projects', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    .then(res => setProjects(res.data))
    .catch(err => {
      console.error('Error fetching projects:', err);
      setError('Projeler yüklenirken bir hata oluştu');
      setProjects([]);
    });
  }, []);

  // Category related handlers
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory('');
    }
  };

  // Project related handlers
  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProject = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Basic validation
    if (!projectForm.name || !projectForm.description) {
      alert('Lütfen zorunlu alanları doldurunuz');
      return;
    }

    axios.post('http://localhost:8000/api/projects', projectForm, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setProjects(prev => [...prev, res.data]);
      setAddProjectOpen(false);
      setProjectForm({
        name: '',
        description: '',
        category: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'Aktif'
      });
    })
    .catch(err => {
      console.error('Error adding project:', err);
      setError('Proje eklenirken bir hata oluştu');
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 1 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            {Array.from(new Array(4)).map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      );
    }

    switch (tab) {
      case 0: // Dashboard
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" gutterBottom>Dashboard</Typography>
              <Typography variant="body1" color="text.secondary">Genel istatistikler ve özet bilgiler</Typography>
            </Box>
            {/* KPI Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
              {/* KPI Cards will be rendered here */}
            </Box>
            {/* Main Content */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { md: '2fr 1fr' }, gap: 3, mb: 3 }}>
              {/* Main Chart */}
              <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" gutterBottom>Aylık İstatistikler</Typography>
                {/* Chart will be rendered here */}
              </Box>
              {/* Sidebar */}
              <Box>
                <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 1, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Son Etkinlikler</Typography>
                  {/* Recent activities will be rendered here */}
                </Box>
              </Box>
            </Box>
          </Box>
        );
      // Add other cases for different tabs
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4">Sayfa Bulunamadı</Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            bgcolor: 'background.paper',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button selected={tab === 0} onClick={() => setTab(0)}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            {/* Add other menu items */}
          </List>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
};

// KPICard Component
const KPICard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = '#3B82F6', 
  hoverColor = '#1D4ED8' 
}) => {
  return (
    <Box sx={{ 
      bgcolor: 'background.paper',
      borderRadius: 3, 
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)', 
      p: 2.5, 
      border: `1px solid ${color}1A`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: `0 4px 20px ${color}1F`,
        transform: 'translateY(-1px)',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${color} 0%, ${hoverColor} 100%)`,
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography sx={{ 
            fontSize: 11, 
            fontWeight: 600, 
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            mb: 0.5
          }}>
            {title}
          </Typography>
          <Typography sx={{ 
            fontSize: 28, 
            fontWeight: 800, 
            color: '#111827',
            lineHeight: 1,
            mb: 0.5
          }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ 
          width: 44, 
          height: 44, 
          background: `linear-gradient(135deg, ${color} 0%, ${hoverColor} 100%)`, 
          borderRadius: 2.5, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: `0 2px 8px ${color}40`
        }}>
          {icon}
        </Box>
      </Box>
      {change && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: `${color}1A`, 
            color: hoverColor, 
            px: 1.5, 
            py: 0.5, 
            borderRadius: 1.5, 
            fontSize: 11, 
            fontWeight: 700
          }}>
            {change.icon}
            {change.value}
          </Box>
          <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>
            {change.label}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));
  const [kpis, setKpis] = React.useState({
    total_sales: 0,
    total_projects: 0,
    total_visits: 0
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  // Fetch KPIs
  React.useEffect(() => {
    // TODO: Replace with actual API call
    const fetchKPIs = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setKpis({
            total_sales: 125000,
            total_projects: 42,
            total_visits: 187
          });
        }, 500);
      } catch (error) {
        console.error('Error fetching KPIs:', error);
      }
    };

    if (isAuthenticated) {
      fetchKPIs();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardLayout onLogout={handleLogout} toggleColorMode={toggleColorMode}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <KPICard 
            title="Toplam Satış"
            value={`₺${kpis.total_sales?.toLocaleString('tr-TR') || '0'}`}
            change={{
              value: '+12.5%',
              label: 'vs last month',
              icon: (
                <svg width="10" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 1.5L6 5L10 5L7 7L8 10.5L5 9L2 10.5L3 7L0 5L4 5L5 1.5Z" fill="currentColor"/>
                </svg>
              )
            }}
            icon={
              <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1.5L10.9 6.9L18.5 7.5L10.9 8.1L10 13.5L9.1 8.1L1.5 7.5L9.1 6.9L10 1.5Z" fill="white"/>
              </svg>
            }
            color="#3B82F6"
            hoverColor="#1D4ED8"
          />
          
          <KPICard 
            title="Toplam Proje"
            value={kpis.total_projects?.toLocaleString('tr-TR') || '0'}
            change={{
              value: '+8.2%',
              label: 'vs last month',
              icon: (
                <svg width="10" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 7.5L7.5 2.5L10.5 5.5L17.5 0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
            }}
            icon={
              <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 6V4.5a1.5 1.5 0 011.5-1.5h12a1.5 1.5 0 011.5 1.5V6M2.5 6l7.5 5 7.5-5M2.5 6v8.5a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            color="#22C55E"
            hoverColor="#16A34A"
          />
          
          <KPICard 
            title="Toplam Ziyaret"
            value={kpis.total_visits?.toLocaleString('tr-TR') || '0'}
            change={{
              value: '+15.3%',
              label: 'vs last month',
              icon: (
                <svg width="10" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 7.5L7.5 2.5L10.5 5.5L17.5 0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
            }}
            icon={
              <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10a3.125 3.125 0 100-6.25 3.125 3.125 0 000 6.25z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.81 9.375a5.938 5.938 0 10-11.62 0 5.938 5.938 0 0011.62 0z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            color="#F59E0B"
            hoverColor="#D97706"
          />
        </Box>
      </DashboardLayout>
    </ThemeProvider>
  );
}

                p: 2.5, 
                border: '1px solid rgba(249, 115, 22, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(249, 115, 22, 0.12)',
                  transform: 'translateY(-1px)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #F97316 0%, #EA580C 100%)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography sx={{ 
                      fontSize: 11, 
                      fontWeight: 600, 
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      mb: 0.5
                    }}>Toplam Ziyaret</Typography>
                    <Typography sx={{ 
                      fontSize: 28, 
                      fontWeight: 800, 
                      color: '#111827',
                      lineHeight: 1,
                      mb: 0.5
                    }}>{kpis?.total_visits?.toLocaleString('tr-TR') ?? '0'}</Typography>
                  </Box>
                  <Box sx={{ 
                    width: 44, 
                    height: 44, 
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', 
                    borderRadius: 2.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)'
                  }}>
                    <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.7 13.9L11.2 17.4a1.7 1.7 0 01-2.4 0l-3.5-3.5a6.7 6.7 0 119.4 0z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12.5 9.2a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: 'rgba(249, 115, 22, 0.1)', 
                    color: '#C2410C', 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 1.5, 
                    fontSize: 11, 
                    fontWeight: 700
                  }}>
                    <svg width="10" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 7.5L7.5 2.5L10.5 5.5L17.5 0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    +15.3%
                  </Box>
                  <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>vs last month</Typography>
                </Box>
              </Box>

              {/* Target Achievement Card - Purple Theme */}
              <Box sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3, 
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)', 
                p: 2.5, 
                border: '1px solid rgba(139, 92, 246, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.12)',
                  transform: 'translateY(-1px)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography sx={{ 
                      fontSize: 11, 
                      fontWeight: 600, 
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      mb: 0.5
                    }}>Hedef Gerçekleşme</Typography>
                    <Typography sx={{ 
                      fontSize: 28, 
                      fontWeight: 800, 
                      color: '#111827',
                      lineHeight: 1,
                      mb: 0.5
                    }}>{kpis?.target_ratio ?? 0}%</Typography>
                  </Box>
                  <Box sx={{ 
                    width: 44, 
                    height: 44, 
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', 
                    borderRadius: 2.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)'
                  }}>
                    <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 10l1.7 1.7 3.3-3.4m5 1.7a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: kpis?.target_ratio >= 80 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    color: kpis?.target_ratio >= 80 ? '#059669' : '#DC2626', 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 1.5, 
                    fontSize: 11, 
                    fontWeight: 700
                  }}>
                    {kpis?.target_ratio >= 80 ? (
                      <svg width="10" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 10l1.7 1.7 3.3-3.4m5 1.7a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="10" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 7.5l-1.7-1.7-1.6 1.7M6.7 4.2v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {kpis?.target_ratio >= 80 ? 'Hedefte' : 'Geride'}
                  </Box>
                  <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>hedef durumu</Typography>
                </Box>
              </Box>
            </Box>

            {/* Modern Charts Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3 }}>
              {/* Sales Trend Chart - Enhanced */}
              <Box sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 4, 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
                p: 2.5, 
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827', mb: 1 }}>Satış Trendi</Typography>
                    <Typography sx={{ fontSize: 14, color: '#6B7280' }}>Aylık satış performans özeti</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#3B82F6', borderRadius: '50%' }}></Box>
                    <Typography sx={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Satışlar</Typography>
                  </Box>
                </Box>
                <Box sx={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={Array.isArray(salesTrend) ? salesTrend : []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#9CA3AF" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₺${value.toLocaleString('tr-TR')}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: theme.palette.mode === 'dark' ? '#1F2937' : '#FFFFFF', 
                          border: 'none',
                          borderRadius: 12,
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                          color: theme.palette.mode === 'dark' ? '#F9FAFB' : '#111827'
                        }}
                        formatter={(value) => [`₺${value.toLocaleString('tr-TR')}`, 'Satış']}
                        labelFormatter={(label) => `Dönem: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total_sales" 
                        stroke="#3B82F6" 
                        strokeWidth={3} 
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} 
                        activeDot={{ r: 6, fill: '#1D4ED8' }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              {/* Revenue Distribution - Donut Chart */}
              <Box sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 4, 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
                p: 2.5, 
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)',
                }
              }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827', mb: 1 }}>Gelir Dağılımı</Typography>
                  <Typography sx={{ fontSize: 14, color: '#6B7280' }}>Ürün kategorilerine göre</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <PieChart width={200} height={200}>
                    <Pie
                      data={Array.isArray(revenueDistribution) && revenueDistribution.length > 0 ? revenueDistribution : [
                        { name: 'Yükleniyor...', value: 100, color: '#E5E7EB' }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(Array.isArray(revenueDistribution) && revenueDistribution.length > 0 ? revenueDistribution : [
                        { name: 'Yükleniyor...', value: 100, color: '#E5E7EB' }
                      ]).map((entry, idx) => (
                        <Cell 
                          key={`cell-${idx}`} 
                          fill={entry.color || ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'][idx % 5]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: theme.palette.mode === 'dark' ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: 12,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        color: theme.palette.mode === 'dark' ? '#F9FAFB' : '#111827'
                      }}
                      formatter={(value, name, props) => [
                        `₺${value.toLocaleString('tr-TR')}`, 
                        props.payload.name
                      ]}
                    />
                  </PieChart>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2, width: '100%' }}>
                    {(Array.isArray(revenueDistribution) && revenueDistribution.length > 0 ? revenueDistribution : [
                      { name: 'Veri yükleniyor...', value: 100, color: '#E5E7EB' }
                    ]).map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            bgcolor: item.color || ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'][idx % 5], 
                            borderRadius: '50%' 
                          }}></Box>
                          <Typography 
                            sx={{ 
                              fontSize: 12, 
                              color: theme.palette.mode === 'dark' ? '#E5E7EB' : '#4B5563',
                              maxWidth: '100px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={item.name}
                          >
                            {item.name}
                          </Typography>
                        </Box>
                        <Typography 
                          sx={{ 
                            fontSize: 12, 
                            fontWeight: 600, 
                            color: theme.palette.mode === 'dark' ? '#F9FAFB' : '#111827' 
                          }}
                        >
                          ₺{item.value?.toLocaleString('tr-TR') || '0'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Additional Modern Charts Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
              {/* Performance Metrics - Bar Chart */}
              <Box sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 4, 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
                p: 4, 
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)',
                }
              }}>
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 1 }}>Takım Performansı</Typography>
                  <Typography sx={{ fontSize: 14, color: '#6B7280' }}>Bireysel satış başarıları</Typography>
                </Box>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart 
                      data={Array.isArray(salespersonPerf) && salespersonPerf.length > 0 ? salespersonPerf : [
                        { name: 'Veri yok', value: 0 }
                      ]} 
                      margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'} 
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ 
                          fill: theme.palette.mode === 'dark' ? '#9CA3AF' : '#6B7280',
                          fontSize: 12,
                          fontWeight: 500
                        }}
                        tickMargin={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ 
                          fill: theme.palette.mode === 'dark' ? '#9CA3AF' : '#6B7280',
                          fontSize: 11,
                          fontWeight: 500
                        }}
                        tickFormatter={(value) => `${value}%`}
                        tickMargin={10}
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: theme.palette.mode === 'dark' ? '#1F2937' : '#FFFFFF',
                          border: 'none',
                          borderRadius: 8,
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                          color: theme.palette.mode === 'dark' ? '#F9FAFB' : '#111827',
                          padding: '8px 12px',
                          fontSize: 13
                        }}
                        formatter={(value, name, props) => {
                          return [`%${value}`, 'Hedef Tamamlama'];
                        }}
                        labelFormatter={(label) => `Satış Temsilcisi: ${label}`}
                        cursor={{ fill: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)' }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]}
                        name="Hedef Tamamlama"
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {Array.isArray(salespersonPerf) && salespersonPerf.length > 0 ? (
                          salespersonPerf.map((entry, index) => {
                            // Determine color based on performance
                            let fillColor;
                            if (entry.value >= 90) {
                              fillColor = '#10B981'; // Green for high performance
                            } else if (entry.value >= 70) {
                              fillColor = '#3B82F6'; // Blue for medium performance
                            } else if (entry.value > 0) {
                              fillColor = '#F59E0B'; // Orange for low performance
                            } else {
                              fillColor = theme.palette.mode === 'dark' ? '#374151' : '#E5E7EB'; // Gray for no data
                            }
                            
                            return (
                              <Cell 
                                key={`cell-${index}`}
                                fill={fillColor}
                                style={{
                                  transition: 'all 0.3s ease-out',
                                  cursor: 'pointer',
                                  opacity: 0.9,
                                  '&:hover': {
                                    opacity: 1,
                                    transform: 'scaleY(1.05)'
                                  }
                                }}
                              />
                            );
                          })
                        ) : (
                          <Cell fill={theme.palette.mode === 'dark' ? '#374151' : '#E5E7EB'} />
                        )}
                      </Bar>
                      <ReferenceLine 
                        y={70} 
                        stroke={theme.palette.mode === 'dark' ? '#6B7280' : '#9CA3AF'} 
                        strokeDasharray="3 3"
                        strokeWidth={1}
                        label={{
                          value: 'Hedef',
                          position: 'insideTopRight',
                          fill: theme.palette.mode === 'dark' ? '#9CA3AF' : '#6B7280',
                          fontSize: 11,
                          fontWeight: 500
                        }}
                      />
                    </ReBarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              {/* Monthly Progress - Area Chart */}
              <Box sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 4, 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
                p: 4, 
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)',
                }
              }}>
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 1 }}>Aylık İlerleme</Typography>
                  <Typography sx={{ fontSize: 14, color: '#6B7280' }}>Ziyaretler ve proje tamamlama</Typography>
                </Box>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={Array.isArray(kpis?.monthly_progress) && kpis.monthly_progress.length > 0 
                        ? kpis.monthly_progress 
                        : Array(6).fill(0).map((_, i) => ({
                            month: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][i],
                            visits: 0,
                            projects: 0
                          }))
                      }
                      margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ 
                          fill: theme.palette.mode === 'dark' ? '#9CA3AF' : '#6B7280',
                          fontSize: 11,
                          fontWeight: 500
                        }}
                        tickMargin={10}
                      />
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ 
                          fill: theme.palette.mode === 'dark' ? '#9CA3AF' : '#6B7280',
                          fontSize: 11,
                          fontWeight: 500
                        }}
                        tickFormatter={(value) => value.toLocaleString('tr-TR')}
                        tickMargin={10}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ 
                          fill: theme.palette.mode === 'dark' ? '#9CA3AF' : '#6B7280',
                          fontSize: 11,
                          fontWeight: 500
                        }}
                        tickMargin={10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: theme.palette.mode === 'dark' ? '#1F2937' : '#FFFFFF',
                          border: 'none',
                          borderRadius: 8,
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                          color: theme.palette.mode === 'dark' ? '#F9FAFB' : '#111827',
                          padding: '8px 12px',
                          fontSize: 13
                        }}
                        formatter={(value, name) => {
                          const label = name === 'visits' ? 'Ziyaret' : 'Proje';
                          return [value, label];
                        }}
                        labelFormatter={(label) => `Ay: ${label}`}
                        cursor={{ fill: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)' }}
                      />
                      <defs>
                        <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="visits" 
                        name="Ziyaretler"
                        stroke="#3B82F6"
                        fillOpacity={1}
                        fill="url(#visitsGradient)" 
                        strokeWidth={2}
                        activeDot={{ 
                          r: 6, 
                          stroke: '#FFFFFF', 
                          strokeWidth: 2, 
                          fill: '#3B82F6' 
                        }}
                      />
                      <Area 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="projects" 
                        name="Projeler"
                        stroke="#10B981"
                        fillOpacity={1}
                        fill="url(#projectsGradient)" 
                        strokeWidth={2}
                        activeDot={{ 
                          r: 6, 
                          stroke: '#FFFFFF', 
                          strokeWidth: 2, 
                          fill: '#10B981' 
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Box>
          </Box>
/* ... */
        );
      case 1: // Harita Yönetimi
      case 5: // Bölgeler
        return (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700, mb: 3 }}>
              {tab === 1 ? 'Harita Yönetimi' : 'Bölgeler'}
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0, borderRadius: 4, overflow: 'hidden' }}>
              <RegionsMap onLogout={onLogout} />
            </Box>
          </Box>
        );
      case 2: // Ziyaretler
        return (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header with Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '28px', mb: 0.5 }}>Ziyaretler</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '14px' }}>Müşteri ziyaretlerinizi yönetin ve takip edin</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 3,
                    py: 1,
                    border: '1px solid #E5E7EB',
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: '#F9FAFB',
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  Filtrele
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    bgcolor: '#3B82F6',
                    '&:hover': {
                      bgcolor: '#2563EB'
                    }
                  }}
                >
                  Yeni Ziyaret
                </Button>
              </Box>
            </Box>
            
            {/* Enhanced KPI Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3, 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', 
                p: 3, 
                border: '1px solid #F3F4F6',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-1px)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>Toplam Ziyaret</Typography>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: '#EFF6FF', 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 8.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" stroke="#3B82F6" strokeWidth="1.5"/><path d="M10 6v4l2 2" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary', mb: 1 }}>{visits.length}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: '#DCFCE7', 
                    color: '#166534', 
                    px: 2, 
                    py: 0.5, 
                    borderRadius: 1, 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    +5.2%
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>bu ay</Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3, 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', 
                p: 3, 
                border: '1px solid #F3F4F6',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-1px)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>Otomatik Ziyaret</Typography>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: '#F0FDF4', 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary', mb: 1 }}>{visits.filter(v => v.is_auto_detected).length}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: '#FEF3C7', 
                    color: '#92400E', 
                    px: 2, 
                    py: 0.5, 
                    borderRadius: 1, 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    {visits.length > 0 ? Math.round((visits.filter(v => v.is_auto_detected).length / visits.length) * 100) : 0}%
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>otomatik</Typography>
                </Box>
              </Box>
            </Box>
            {/* Enhanced Visits Table */}
            <Box sx={{ 
              flex: 1, 
              bgcolor: 'background.paper', 
              borderRadius: 3, 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', 
              border: '1px solid #F3F4F6',
              overflow: 'hidden'
            }}>
              {/* Table Header */}
              <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>Son Ziyaretler</Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F9FAFB', borderRadius: 2, px: 2, py: 1 }}>
                      <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 00-2 2v8a2 2 0 002 2h7m0-10l2-2m-2 2l2 2m-2-2v12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>Export</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F9FAFB', borderRadius: 2, px: 2, py: 1 }}>
                      <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" stroke="#6B7280" strokeWidth="1.5"/></svg>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>View</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {/* Enhanced DataGrid */}
              <DataGrid
                rows={visits}
                columns={visitColumns}
                loading={loading && visits.length === 0}
                autoHeight
                disableRowSelectionOnClick
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-cell': { 
                    borderBottom: '1px solid #F3F4F6',
                    color: 'text.primary',
                    fontSize: '14px',
                    py: 2
                  },
                  '& .MuiDataGrid-columnHeaders': { 
                    bgcolor: '#FAFBFC',
                    color: 'text.secondary',
                    borderBottom: '1px solid #E5E7EB',
                    fontSize: '13px',
                    fontWeight: 600,
                    '& .MuiDataGrid-columnHeader': {
                      py: 2
                    }
                  },
                  '& .MuiDataGrid-footerContainer': { 
                    bgcolor: '#FAFBFC',
                    color: 'text.secondary',
                    borderTop: '1px solid #E5E7EB',
                    minHeight: '52px'
                  },
                  '& .MuiDataGrid-row': {
                    '&:hover': {
                      bgcolor: '#F9FAFB',
                      cursor: 'pointer'
                    }
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    minHeight: '400px'
                  }
                }}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
              />
            </Box>
          </Box>
        );
      case 3: // Projeler
        return (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header with Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '28px', mb: 0.5 }}>Projeler</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '14px' }}>Proje portföyünüzü yönetin ve takip edin</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" stroke="currentColor" strokeWidth="1.5"/></svg>}
                  onClick={() => setCategoriesOpen(true)}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 3,
                    py: 1,
                    border: '1px solid #E5E7EB',
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: '#F9FAFB',
                      borderColor: '#D1D5DB',
                      color: '#10B981',
                      borderColor: '#10B981'
                    }
                  }}
                >
                  Kategoriler
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
                  onClick={() => {
                    setProjectForm({
                      name: '',
                      description: '',
                      category: categories[0] || '',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: '',
                      status: 'Aktif'
                    });
                    setAddProjectOpen(true);
                  }}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    bgcolor: '#10B981',
                    '&:hover': {
                      bgcolor: '#059669'
                    }
                  }}
                >
                  Yeni Proje
                </Button>
              </Box>
            </Box>
            
            {/* Enhanced Project KPI Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3, 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', 
                p: 3, 
                border: '1px solid #F3F4F6',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-1px)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>Toplam Proje</Typography>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: '#EFF6FF', 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 7l-7 7-3-3-9 9" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="13,7 19,7 19,13" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary', mb: 1 }}>{projects.length}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: '#DCFCE7', 
                    color: '#166534', 
                    px: 2, 
                    py: 0.5, 
                    borderRadius: 1, 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    +12.3%
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>bu çeyrek</Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3, 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', 
                p: 3, 
                border: '1px solid #F3F4F6',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-1px)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>Aktif Proje</Typography>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: '#F0FDF4', 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <NotificationsIcon sx={{ color: '#10B981' }} />
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary', mb: 1 }}>12</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: '#FEF2F2', 
                    color: '#991B1B', 
                    px: 2, 
                    py: 0.5, 
                    borderRadius: 1, 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    -2.5%
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>geçen aya göre</Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3, 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', 
                p: 3, 
                border: '1px solid #F3F4F6',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-1px)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>Tamamlanan</Typography>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: '#F5F3FF', 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16a7 7 0 100-14 7 7 0 000 14z" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 10l-2 2-1-1" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary', mb: 1 }}>8</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: '#F3F4F6', 
                    color: '#4B5563', 
                    px: 2, 
                    py: 0.5, 
                    borderRadius: 1, 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    +3.2%
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>geçen aya göre</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Enhanced Projects Table */}
            <Box sx={{ 
              flex: 1, 
              bgcolor: 'background.paper', 
              borderRadius: 3, 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', 
              border: '1px solid #F3F4F6',
              overflow: 'hidden'
            }}>
              {/* Table Header */}
              <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      bgcolor: '#FEF3C7', 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <BarChartIcon sx={{ color: '#F59E0B', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>Proje Yönetimi</Typography>
                      <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Tüm projelerinizi takip edin ve yönetin</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<DownloadIcon />}
                      sx={{ 
                        borderColor: '#E5E7EB',
                        color: 'text.secondary',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          borderColor: '#F59E0B',
                          color: '#F59E0B',
                          bgcolor: '#FFFBEB'
                        }
                      }}
                    >
                      Dışa Aktar
                    </Button>
                  </Box>
                </Box>
              </Box>
              
              {/* Enhanced DataGrid */}
              <DataGrid
                rows={projects}
                columns={projectColumns}
                loading={loading && projects.length === 0}
                autoHeight
                disableRowSelectionOnClick
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-cell': { 
                    borderBottom: '1px solid #F3F4F6',
                    color: 'text.primary',
                    fontSize: '14px',
                    py: 2
                  },
                  '& .MuiDataGrid-columnHeaders': { 
                    bgcolor: '#FAFBFC',
                    color: 'text.secondary',
                    borderBottom: '1px solid #E5E7EB',
                    fontSize: '13px',
                    fontWeight: 600,
                    '& .MuiDataGrid-columnHeader': {
                      py: 2
                    }
                  },
                  '& .MuiDataGrid-footerContainer': { 
                    bgcolor: '#FAFBFC',
                    color: 'text.secondary',
                    borderTop: '1px solid #E5E7EB',
                    minHeight: '52px'
                  },
                  '& .MuiDataGrid-row': {
                    '&:hover': {
                      bgcolor: '#F9FAFB',
                      cursor: 'pointer'
                    }
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    minHeight: '400px'
                  }
                }}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
              />
            </Box>
          </Box>
        );
      case 4: // Kullanıcılar
        return (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header with Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '28px', mb: 0.5 }}>Kullanıcılar</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '14px' }}>Sistem kullanıcılarını yönetin ve yetkilendirin</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" stroke="currentColor" strokeWidth="1.5"/></svg>}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 3,
                    py: 1,
                    border: '1px solid #E5E7EB',
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: '#F9FAFB',
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  Roller
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
                  onClick={() => handleOpenUserDialog()}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    bgcolor: '#8B5CF6',
                    '&:hover': {
                      bgcolor: '#7C3AED'
                    }
                  }}
                >
                  Yeni Kullanıcı
                </Button>
              </Box>
            </Box>
            
            {/* Enhanced User KPI Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3, 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', 
                p: 3, 
                border: '1px solid #F3F4F6',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-1px)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>Toplam Kullanıcı</Typography>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: '#EFF6FF', 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary', mb: 1 }}>{users.length}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: '#DCFCE7', 
                    color: '#166534', 
                    px: 2, 
                    py: 0.5, 
                    borderRadius: 1, 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    +3 yeni
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>bu ay</Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3, 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', 
                p: 3, 
                border: '1px solid #F3F4F6',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-1px)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>Aktif Kullanıcı</Typography>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: '#F0FDF4', 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary', mb: 1 }}>{users.filter(u => !u.disabled).length}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: '#DCFCE7', 
                    color: '#166534', 
                    px: 2, 
                    py: 0.5, 
                    borderRadius: 1, 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    {users.length > 0 ? Math.round((users.filter(u => !u.disabled).length / users.length) * 100) : 0}%
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>aktif oran</Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3, 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', 
                p: 3, 
                border: '1px solid #F3F4F6',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-1px)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>Yönetici</Typography>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: '#F0FDF4', 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <NotificationsIcon sx={{ color: '#10B981' }} />
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary', mb: 1 }}>12</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: '#FEF2F2', 
                    color: '#991B1B', 
                    px: 2, 
                    py: 0.5, 
                    borderRadius: 1, 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    -2.5%
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>geçen aya göre</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Enhanced Users Table */}
            <Box sx={{ 
              flex: 1, 
              bgcolor: 'background.paper', 
              borderRadius: 3, 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', 
              border: '1px solid #F3F4F6',
              overflow: 'hidden'
            }}>
              {/* Table Header */}
              <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      bgcolor: '#EEF2FF', 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <PeopleIcon sx={{ color: '#6366F1', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>Kullanıcı Yönetimi</Typography>
                      <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Sistem kullanıcılarını yönetin ve düzenleyin</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<DownloadIcon />}
                      sx={{ 
                        borderColor: '#E5E7EB',
                        color: 'text.secondary',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          borderColor: '#6366F1',
                          color: '#6366F1',
                          bgcolor: '#F8FAFC'
                        }
                      }}
                    >
                      Dışa Aktar
                    </Button>

                  </Box>
                </Box>
              </Box>
              
              {/* Enhanced DataGrid */}
              <DataGrid
                rows={users}
                columns={userColumns}
                loading={loading && users.length === 0}
                autoHeight
                disableRowSelectionOnClick
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-cell': { 
                    borderBottom: '1px solid #F3F4F6',
                    color: 'text.primary',
                    fontSize: '14px',
                    py: 2
                  },
                  '& .MuiDataGrid-columnHeaders': { 
                    bgcolor: '#FAFBFC',
                    color: 'text.secondary',
                    borderBottom: '1px solid #E5E7EB',
                    fontSize: '13px',
                    fontWeight: 600,
                    '& .MuiDataGrid-columnHeader': {
                      py: 2
                    }
                  },
                  '& .MuiDataGrid-footerContainer': { 
                    bgcolor: '#FAFBFC',
                    color: 'text.secondary',
                    borderTop: '1px solid #E5E7EB',
                    minHeight: '52px'
                  },
                  '& .MuiDataGrid-row': {
                    '&:hover': {
                      bgcolor: '#F9FAFB',
                      cursor: 'pointer'
                    }
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    minHeight: '400px'
                  }
                }}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
              />
            </Box>
            <UserDialog open={userDialogOpen} onClose={handleCloseUserDialog} user={currentUser} onSave={handleSaveUser} />
          </Box>
        );
      case 6: // Raporlar
        return <ReportsList />;
      case 7: // Ayarlar (Settings)
        return (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Box>
                <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#111827', mb: 1 }}>Ayarlar</Typography>
                <Typography sx={{ fontSize: 16, color: '#6B7280' }}>Sistem ayarlarınızı yönetin</Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Genel Ayarlar */}
              <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 3 }}>Genel Ayarlar</Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Karanlık Mod"
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: 14, fontWeight: 500 } }}
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Bildirimler"
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: 14, fontWeight: 500 } }}
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Otomatik Güncelleme"
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: 14, fontWeight: 500 } }}
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Ses Bildirimleri"
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: 14, fontWeight: 500 } }}
                    />
                  </Box>
                </CardContent>
              </Card>
              
              {/* Güvenlik Ayarları */}
              <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 3 }}>Güvenlik</Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                      Şifre Değiştir
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                      İki Faktörlü Kimlik Doğrulama
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                      Oturum Geçmişi
                    </Button>
                    <Button variant="outlined" color="error" fullWidth sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                      Hesabı Devre Dışı Bırak
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Veri Ayarları */}
              <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 3 }}>Veri Yönetimi</Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                      Verileri Dışa Aktar
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                      Verileri İçe Aktar
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                      Yedekleme Ayarları
                    </Button>
                    <Button variant="outlined" color="warning" fullWidth sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                      Tüm Verileri Temizle
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Sistem Bilgileri */}
              <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 3 }}>Sistem Bilgileri</Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 14, color: '#6B7280' }}>Sürüm:</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>v2.1.0</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 14, color: '#6B7280' }}>Son Güncelleme:</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>25.07.2025</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 14, color: '#6B7280' }}>Lisans:</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Pro</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 14, color: '#6B7280' }}>Depolama:</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>2.4 GB / 10 GB</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );
      case 8: // Destek (Support)
        return (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Box>
                <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#111827', mb: 1 }}>Destek</Typography>
                <Typography sx={{ fontSize: 16, color: '#6B7280' }}>Yardım ve destek kaynaklarına erişin</Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Hızlı Yardım */}
              <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 3 }}>Hızlı Yardım</Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                      📚 Kullanım Kılavuzu
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                      🎥 Video Eğitimleri
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                      ❓ Sık Sorulan Sorular
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                      💬 Canlı Destek
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              
              {/* İletişim */}
              <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 3 }}>İletişim</Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                      <Typography sx={{ fontSize: 14, color: '#6B7280' }}>Email:</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>destek@bizlink.com</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                      <Typography sx={{ fontSize: 14, color: '#6B7280' }}>Telefon:</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>+90 212 555 0123</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                      <Typography sx={{ fontSize: 14, color: '#6B7280' }}>Çalışma Saatleri:</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>09:00 - 18:00</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Geri Bildirim */}
              <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(0, 0, 0, 0.05)', gridColumn: { md: 'span 2' } }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 3 }}>Geri Bildirim Gönder</Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      fullWidth
                      label="Konu"
                      variant="outlined"
                      size="medium"
                    />
                    <TextField
                      fullWidth
                      label="Mesajınız"
                      variant="outlined"
                      multiline
                      rows={4}
                      size="medium"
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="contained" sx={{ px: 4 }}>
                        Gönder
                      </Button>
                      <Button variant="outlined" sx={{ px: 4 }}>
                        Temizle
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );
      default:
        return (
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 480 }}>
            <Typography variant="h6" color="text.secondary">İçerik yapım aşamasında.</Typography>
          </Box>
        );
    }
  };

    // User info for header/right panel (placeholder)
    const user = {
      name: 'Michael Scott',
      username: '@michaelsc',
      avatar: `https://ui-avatars.com/api/?name=Michael+Scott&background=424242&color=fff`,
    };

    return (
    <Box sx={{
      display: 'flex',
      bgcolor: 'background.default',
      minHeight: '100vh',
      p: 2, // Add padding to match sidebar margin
      boxSizing: 'border-box',
      gap: 0,
    }}>
      {/* Clean Light Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '0 16px 16px 0',
            margin: '16px 0 16px 16px',
            height: 'calc(100vh - 32px)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            color: '#374151', // Dark grey text
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '100vh',
            borderRight: 'none',
            borderRadius: '16px',
            m: 0,
            overflow: 'hidden',
          },
        }}
      >
        <Box>
          <Toolbar sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 80, mb: 1, px: 3, py: 2 }}>
            <Box 
              component="img" 
              src="/assets/logo.png" 
              alt="Logo" 
              sx={{ 
                height: 100, 
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'contain'
              }} 
            />
          </Toolbar>
          <List sx={{ mt: 1, px: 2 }}>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => setTab(item.tabIndex)}
                selected={tab === item.tabIndex}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  bgcolor: tab === item.tabIndex ? '#F97316' : 'transparent', // Orange for active
                  color: tab === item.tabIndex ? '#FFFFFF' : '#374151', // White text on orange, dark grey otherwise
                  '&:hover': { 
                    bgcolor: tab === item.tabIndex ? '#EA580C' : '#F3F4F6', // Darker orange or light grey
                    color: tab === item.tabIndex ? '#FFFFFF' : '#111827',
                  },
                  transition: 'all 0.2s ease-in-out',
                  minHeight: 36,
                  px: 2,
                  py: 0.5,
                }}
              >
                <ListItemIcon sx={{ 
                  color: tab === item.tabIndex ? '#FFFFFF' : '#6B7280', 
                  minWidth: 28,
                  '& .MuiSvgIcon-root': {
                    fontSize: '18px'
                  }
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '13px', 
                    fontWeight: tab === item.tabIndex ? 600 : 500,
                    color: 'inherit'
                  }} 
                />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box>
          <Divider sx={{ mx: 2, my: 2, borderColor: '#E5E7EB' }} />
          <List sx={{ px: 2 }}>
            {bottomMenuItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                onClick={() => setTab(item.tabIndex)} 
                sx={{ 
                  borderRadius: 2, 
                  mb: 0.5, 
                  minHeight: 36,
                  px: 2,
                  py: 0.5,
                  '&:hover': { 
                    bgcolor: '#F3F4F6',
                    color: '#111827'
                  },
                  color: '#6B7280',
                  transition: 'all 0.2s ease-in-out'
                }}>
                <ListItemIcon sx={{ 
                  color: '#6B7280', 
                  minWidth: 28,
                  '& .MuiSvgIcon-root': {
                    fontSize: '18px'
                  }
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '13px', 
                    fontWeight: 500,
                    color: 'inherit'
                  }} 
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      {/* Main content area */}
      <Box component="main" sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        ml: 2,
        borderRadius: '16px',
        bgcolor: 'background.default',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <AppBar position="static" color="transparent" elevation={0} sx={{ 
          borderRadius: '16px 16px 0 0', 
          mb: 0, 
          bgcolor: 'background.paper', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)', 
          px: 3, 
          py: 2, 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          border: '1px solid #F3F4F6',
          borderBottom: 'none'
        }}>
          {/* Search bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box sx={{ bgcolor: 'background.default', borderRadius: 2, px: 2, py: 0.5, display: 'flex', alignItems: 'center', boxShadow: 1, minWidth: 260 }}>
              <svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 12.5L16 16" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round"/><circle cx="8" cy="8" r="6" stroke="#A0A0A0" strokeWidth="2"/></svg>
              <input 
                type="text" 
                placeholder="Arama yapın..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    // Handle search functionality
                    console.log('Searching for:', searchQuery);
                  }
                }}
                style={{ border: 'none', outline: 'none', background: 'transparent', color: theme.palette.text.primary, fontSize: 16, marginLeft: 8, width: '100%' }} 
              />
            </Box>
          </Box>
          {/* User avatar and notifications */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 4 }}>
            <IconButton sx={{ bgcolor: 'background.default', borderRadius: 2, boxShadow: 1, mr: 1 }}>
              <svg width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 2v1M11 19v1M4.22 4.22l.7.7M17.08 17.08l.7.7M2 11h1M19 11h1M4.22 17.08l.7-.7M17.08 4.22l.7-.7" stroke="#5E81F4" strokeWidth="2" strokeLinecap="round"/></svg>
            </IconButton>
            <IconButton 
              sx={{ bgcolor: 'background.default', borderRadius: 2, boxShadow: 1, mr: 1, position: 'relative' }}
              onClick={() => setNotificationOpen(!notificationOpen)}
              title="Bildirimler"
            >
              <svg width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 16v-5a6 6 0 10-12 0v5l-1 1v1h14v-1l-1-1Z" stroke="#5E81F4" strokeWidth="2" strokeLinejoin="round"/><path d="M9 20h4" stroke="#5E81F4" strokeWidth="2" strokeLinecap="round"/></svg>
              {notifications.length > 0 && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: -4, 
                  right: -4, 
                  bgcolor: 'error.main', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: 18, 
                  height: 18, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: 10, 
                  fontWeight: 'bold' 
                }}>
                  {notifications.length}
                </Box>
              )}
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 120, 
                display: { xs: 'none', md: 'block' },
                '& img': {
                  height: 32,
                  width: 'auto',
                  objectFit: 'contain'
                }
              }}>
                <img src="/assets/logo-dark.png" alt="OptiSaha Logo" />
              </Box>
              <Divider orientation="vertical" flexItem sx={{ height: 32, borderColor: 'divider', display: { xs: 'none', md: 'block' } }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.default', borderRadius: 2, px: 2, py: 1, boxShadow: 1 }}>
                <Avatar 
                  sx={{ width: 36, height: 36, bgcolor: 'primary.main', mr: 1 }}
                  src={currentUser?.avatar}
                >
                  {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {currentUser?.full_name || 'Kullanıcı'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 13 }}>
                    @{currentUser?.username || 'username'}
                  </Typography>
                </Box>
              </Box>
              <IconButton color="primary" onClick={onLogout} sx={{ ml: 2, bgcolor: '#23242a', borderRadius: 2, boxShadow: 2, '&:hover': { bgcolor: 'primary.main', color: '#fff' }, transition: 'background 0.2s, color 0.2s', p: 1.2 }} title="Çıkış Yap">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
        </AppBar>
        <Box sx={{ 
          flex: 1, 
          p: 3, 
          bgcolor: 'background.paper',
          border: '1px solid #F3F4F6',
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          overflow: 'auto'
        }}>
          {/* Conditional layout */}
          {tab === 1 || tab === 5 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {renderContent()}
            </Box>
          ) : (
            <>
              {/* Main dashboard content */}
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, height: '100%' }}>
                  {renderContent()}
                  {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );

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

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Validate token and get user data
          const userData = await api.auth.me();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setSnackbar({
          open: true,
          message: 'Oturum doğrulanamadı. Lütfen tekrar giriş yapın.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle snackbar close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {isAuthenticated ? (
          <DashboardLayout onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
