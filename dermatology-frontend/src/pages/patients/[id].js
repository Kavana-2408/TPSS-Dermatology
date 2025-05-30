import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { 
  Box, Typography, Button, Card, CardContent, Divider, 
  Chip, CircularProgress, Alert, Avatar, Paper, Stack, Grid,
  DialogTitle, Dialog, DialogContent, DialogActions, Snackbar
} from '@mui/material';
import {
  ArrowBack, Edit, CalendarToday, Phone, Email, Person, 
  MedicalServices, Close, Add, CloudUpload
} from '@mui/icons-material';
import { getPatientWithPatchTests } from '@/utils/api';
import SchedulePatchTest from '@/components/SchedulePatchTest';
import PatchTestResults from '@/components/PatchTestResults';

export default function PatientDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id && status === 'authenticated') {
      fetchData();
    }
  }, [id, status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await getPatientWithPatchTests(id);
      setPatientData(data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message);
      
      if (err.message.includes('404')) {
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleUploadClick = (testId) => {
    setSelectedTestId(testId);
    setUploadDialogOpen(true);
  };
  
  const handleScheduleClick = () => {
    setScheduleDialogOpen(true);
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedTestId) return;
  
    try {
      setLoading(true);
      setError('');
  
      // Process files sequentially
      for (const file of files) {
        await uploadPatchTestImage(
          patientId,       // From component props
          selectedTestId,  // From state
          file,            // From input
          48,             // Default hours
          ''               // Empty notes
        );
      }
  
      onRefresh(); // Refresh data
      setUploadDialogOpen(false);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message.includes('Failed to fetch') 
        ? 'Could not connect to server'
        : err.message);
    } finally {
      setLoading(false);
      event.target.value = ''; // Reset input
    }
  };
  
  if (status === 'loading' || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!patientData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No patient data available
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push('/dashboard')}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      {/* Patient Information Section */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ 
              bgcolor: patientData.gender === 'Male' ? 'primary.main' : 'secondary.main',
              width: 80,
              height: 80,
              fontSize: '2rem'
            }}>
              {patientData.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold">
                {patientData.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Patient since {formatDate(patientData.created_at)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => router.push(`/patients/${id}/edit`)}
            >
              Edit Profile
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleScheduleClick}
            >
              Schedule Patch Test
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="medium" /> Personal Information
                </Typography>

                <Stack spacing={2.5} sx={{ pl: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gender
                    </Typography>
                    <Typography variant="body1">
                      {patientData.gender || 'Not specified'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(patientData.dob)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Age
                    </Typography>
                    <Typography variant="body1">
                      {calculateAge(patientData.dob)} years
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone fontSize="medium" /> Contact Information
                </Typography>

                <Stack spacing={2.5} sx={{ pl: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1">
                      {patientData.contact_phone || 'Not provided'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      {patientData.contact_email || 'Not provided'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Medical Information */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MedicalServices fontSize="medium" /> Medical Information
                </Typography>

                <Box sx={{ pl: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Medical History
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      minHeight: 120,
                      bgcolor: 'background.paper',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {patientData.medical_history || 'No medical history recorded'}
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Patch Test Results Section */}
      
      <PatchTestResults
  patientId={patientData?.id}
  tests={patientData?.patch_tests  || []}
  onImageClick={handleImageClick}
  onUploadClick={handleUploadClick}
/>

      {/* Image Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Patch Test Image - {selectedImage?.hours_after_patch}h
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL || ''}${selectedImage.image_path}`}
              alt={`Patch test ${selectedImage.hours_after_patch}h`}
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Close />} onClick={handleCloseDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => !uploading && setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>
    {uploading ? 'Uploading Images...' : 'Upload Patch Test Images'}
  </DialogTitle>

  <DialogContent>
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Note: Images will be uploaded one at a time (max 5MB each)
      </Typography>
      <input
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        id="patch-test-upload"
        type="file"
        multiple
        disabled={uploading}
        onChange={handleFileUpload}
      />
      <label htmlFor="patch-test-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          fullWidth
          sx={{ py: 2 }}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Select Images (JPEG/PNG)'}
        </Button>
      </label>
    </Box>
  </DialogContent>
</Dialog>
      {/* Schedule Patch Test Dialog */}
      <SchedulePatchTest
        patientId={id}
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        onSuccess={(testIds) => {
          fetchData();
          setSnackbarMessage('Patch test scheduled successfully!');
          setSnackbarOpen(true);
          if (testIds && testIds.length > 0) {
            setSelectedTestId(testIds[0]);
            setUploadDialogOpen(true);
          }
        }}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}