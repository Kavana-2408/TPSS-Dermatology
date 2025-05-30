import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { 
  Box, Typography, TextField, Button, 
  MenuItem, Select, FormControl, InputLabel, Alert,
  CircularProgress, Paper, Snackbar
} from '@mui/material';

export default function NewPatientPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    contact_phone: '',
    contact_email: '',
    medical_history: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
  
    try {
      const patientData = {
        name: formData.name.trim(),
        dob: new Date(formData.dob).toISOString(),
        gender: formData.gender,
        contact_phone: formData.contact_phone || null,
        contact_email: formData.contact_email || null,
        medical_history: formData.medical_history || null,
        doctor_id: '6d165e14-6b99-47e2-a8cf-1bf50e561c9b'
      };
  
      // Use absolute URL in development
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/api/patients'
        : '/api/patients';
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Patient created:', data);
      setSnackbarOpen(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message.includes('<!DOCTYPE html>') 
        ? 'API endpoint not found. Check server logs.' 
        : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Register New Patient
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Date of Birth *"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Gender *</InputLabel>
            <Select
              name="gender"
              value={formData.gender}
              label="Gender *"
              onChange={handleChange}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Phone Number"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Medical History"
            name="medical_history"
            value={formData.medical_history}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Creating...' : 'Create Patient'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message="Patient created successfully!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}