import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { 
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Badge,
  Snackbar
} from '@mui/material';
import {
  People,
  MedicalServices,
  InsertPhoto,
  Assessment,
  ExitToApp,
  LocalHospital,
  Refresh,
  CloudOff
} from '@mui/icons-material';
import { getDoctorsPatients } from '@/utils/api';

const DOCTOR_ID = '6d165e14-6b99-47e2-a8cf-1bf50e561c9b';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [doctorData, setDoctorData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendOnline, setBackendOnline] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    recentPatients: 0,
    pendingReviews: 0
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDoctorData();
     
    }
  }, [status]);

  

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const response = await getDoctorsPatients(DOCTOR_ID);
      
      // Handle both response formats
      const patients = response.success ? response.patients : response.data;
      const count = response.success ? response.count : response.data?.length;
      
      setPatients(patients || []);
      setStats({
        totalPatients: count || 0,
        recentPatients: patients?.length || 0,
        pendingReviews: patients?.filter(p => !p.medical_history).length || 0
      });
      
    } catch (error) {
      setError(error.message || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handlePatientClick = (patientId) => {
    router.push(`/patients/${patientId}`);
  };

  const handleRetryConnection = () => {
    fetchDoctorData();
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Connection Status Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={backendOnline ? 'success' : 'warning'}
          icon={backendOnline ? null : <CloudOff />}
          sx={{ width: '100%' }}
        >
          {backendOnline ? 'Back online - data synced' : 'Connection lost - working offline'}
        </Alert>
      </Snackbar>

      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Dermatology Portal
          </Typography>
          {doctorData && (
            <Typography variant="subtitle1" color="text.secondary">
              {doctorData.name} • {doctorData.email}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!backendOnline && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Refresh />}
              onClick={handleRetryConnection}
            >
              Reconnect
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<ExitToApp />}
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Sign Out
          </Button>
        </Box>
      </Box>

      {/* Connection Status Alert */}
      {!backendOnline && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRetryConnection}
            >
              RETRY
            </Button>
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudOff sx={{ mr: 1 }} />
            You're currently offline. Data may be outdated.
          </Box>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {stats.totalPatients}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Patients
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalHospital color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {stats.recentPatients}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Patients
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assessment color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {stats.pendingReviews}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Reviews
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Patients Section */}
      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="h6" component="h2" fontWeight="bold">
              Patient Records
            </Typography>
            <Button 
              variant="contained"
              onClick={() => router.push('/patients/new')}
              disabled={!backendOnline}
            >
              New Patient
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : patients.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              No patients found in the system
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {patients.map((patient) => (
                <Grid item xs={12} sm={6} md={4} key={patient.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: patient.gender === 'Male' ? 'primary.main' : 'secondary.main', 
                          mr: 2,
                          width: 56,
                          height: 56
                        }}>
                          {patient.name.trim().charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {patient.name.trim()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {calculateAge(patient.dob)} years • {patient.gender}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Phone:</strong> {patient.contact_phone || 'Not provided'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong> {patient.contact_email || 'Not provided'}
                        </Typography>
                      </Box>

                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mt: 'auto'
                      }}>
                        <Chip 
                          label={new Date(patient.created_at).toLocaleDateString()} 
                          size="small"
                          variant="outlined"
                        />
                        <Badge
                          color={patient.medical_history ? 'success' : 'error'}
                          badgeContent={patient.medical_history ? 'Complete' : 'Incomplete'}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <Button 
                        size="small"
                        startIcon={<InsertPhoto />}
                        onClick={() => handlePatientClick(patient.id)}
                        disabled={!backendOnline}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<People />}
                onClick={() => router.push('/patients/new')}
                sx={{ py: 2 }}
                disabled={!backendOnline}
              >
                New Patient
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
  <Button
    fullWidth
    variant="contained"
    startIcon={<Assessment />}
    component="a"
    href="http://localhost:8501"
    target="_blank"
    rel="noopener noreferrer"
    sx={{ py: 2 }}
    disabled={!backendOnline}
  >
    AI Analysis
  </Button>
</Grid>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<MedicalServices />}
                onClick={() => router.push('/appointments')}
                sx={{ py: 2 }}
                disabled={!backendOnline}
              >
                Schedule
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}