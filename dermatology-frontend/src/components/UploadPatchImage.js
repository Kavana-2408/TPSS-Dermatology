import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

export default function UploadPatchImage({ 
  patientId, 
  open, 
  onClose, 
  onSuccess,
  patchTests = [],
  selectedTestId: initialTestId = ''
}) {
  const [selectedTestId, setSelectedTestId] = useState(initialTestId);
  const [hoursAfterPatch, setHoursAfterPatch] = useState(48);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedTestId(initialTestId || '');
      setHoursAfterPatch(48);
      setFile(null);
      setError('');
      setNotes('');
    }
  }, [open, initialTestId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
      setError('Only JPEG/PNG images are allowed');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedTestId) {
      setError('Please select a patch test');
      return;
    }

    if (!file) {
      setError('Please select an image file');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('image', file);
      formData.append('patch_test_id', selectedTestId);
      formData.append('hours_after_patch', hoursAfterPatch.toString());
      formData.append('notes', notes);

      const response = await fetch(`/api/patients/${patientId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 
          errorData.message || 
          `Upload failed with status ${response.status}`
        );
      }

      const data = await response.json();
      onSuccess(data);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Patch Test Image</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Patch Test</InputLabel>
            <Select
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              label="Patch Test"
              disabled={loading}
            >
              <MenuItem value="">Select a test</MenuItem>
              {patchTests.map((test) => (
                <MenuItem key={test.id} value={test.id}>
                  {formatTestDate(test.test_date)} - {test.notes || 'No notes'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Hours After Patch</InputLabel>
            <Select
              value={hoursAfterPatch}
              onChange={(e) => setHoursAfterPatch(e.target.value)}
              label="Hours After Patch"
              disabled={loading}
            >
              <MenuItem value={48}>48 hours</MenuItem>
              <MenuItem value={96}>96 hours</MenuItem>
              <MenuItem value={168}>168 hours</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Doctor Notes"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 2 }}
            disabled={loading}
          />

          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            Select Image
            <input
              type="file"
              hidden
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              disabled={loading}
            />
          </Button>

          {file && (
            <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
              <Typography variant="subtitle2">Selected Image:</Typography>
              <Typography>{file.name}</Typography>
              <Typography variant="caption">
                {(file.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!selectedTestId || !file || loading}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function formatTestDate(dateString) {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}