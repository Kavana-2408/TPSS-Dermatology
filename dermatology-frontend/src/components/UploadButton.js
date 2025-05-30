import { useState } from 'react';
import { 
  Button, 
  CircularProgress, 
  Alert, 
  Box,
  TextField,
  Typography 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function ImageUpload({ patientId, patchTestId, onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoursAfterPatch, setHoursAfterPatch] = useState(48);
  const [notes, setNotes] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('hours_after_patch', hoursAfterPatch.toString());
      formData.append('patch_test_id', patchTestId);
      formData.append('notes', notes);

      const response = await fetch(`/api/patch-tests/${patientId}/upload`, {
        method: 'POST',
        body: formData
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text.includes('<!DOCTYPE html>') 
          ? 'Server error: Please check the API endpoint'
          : text);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed. Please try again.');
      }

      if (data.success) {
        onUploadSuccess(data.image);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message.includes('Patch test not found')
        ? 'Invalid patch test ID or it does not belong to this patient'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Upload Patch Test Image
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="upload-image"
          type="file"
          onChange={handleUpload}
          disabled={loading}
        />
        <label htmlFor="upload-image">
          <Button
            variant="contained"
            component="span"
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Select Image'}
          </Button>
        </label>

        <TextField
          label="Hours After Patch"
          type="number"
          value={hoursAfterPatch}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if ([48, 96, 168].includes(value)) {
              setHoursAfterPatch(value);
            }
          }}
          select
          sx={{ width: 150 }}
          SelectProps={{
            native: true,
          }}
        >
          <option value={48}>48 hours</option>
          <option value={96}>96 hours</option>
          <option value={168}>168 hours</option>
        </TextField>
      </Box>

      <TextField
        label="Doctor Notes"
        fullWidth
        multiline
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        sx={{ mb: 2 }}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
        Patient ID: {patientId} | Patch Test ID: {patchTestId}
      </Typography>
    </Box>
  );
}