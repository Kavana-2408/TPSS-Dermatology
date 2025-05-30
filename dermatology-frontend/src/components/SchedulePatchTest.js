import { useState } from 'react';
import { 
  Box, Button, Dialog, DialogActions, DialogContent, 
  DialogTitle, TextField, Alert, CircularProgress, Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { schedulePatchTests } from '@/utils/api';

export default function SchedulePatchTest({ patientId, open, onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSchedule = async () => {
    if (!selectedDate) return;
    
    try {
      setLoading(true);
      setError('');
      
      const dateString = selectedDate.toISOString().split('T')[0];
      const testIds = await schedulePatchTests(patientId, dateString);
      
      onSuccess(testIds);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Patch Test</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <DatePicker
            label="Initial Test Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2">This will create:</Typography>
          <ul>
            <li>Initial test on selected date</li>
            <li>48-hour follow-up</li>
            <li>96-hour follow-up</li>
            <li>7-day follow-up</li>
          </ul>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSchedule} 
          variant="contained"
          disabled={!selectedDate || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Scheduling...' : 'Schedule Tests'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}