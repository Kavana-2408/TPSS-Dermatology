// components/ImageUploadModal.js
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Modal, Box, Button, Typography, Stepper, Step, StepLabel } from '@mui/material';
import api from '../utils/api';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: '60%' },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  overflowY: 'auto'
};

export default function ImageUploadModal({ open, onClose, patientId, patchTestId }) {
  const { data: session } = useSession();
  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState({
    48: null,
    96: null,
    168: null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (hours, file) => {
    setImages(prev => ({ ...prev, [hours]: file }));
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!session) {
      setUploadError('Session expired. Please log in again.');
      return;
    }

    setUploading(true);
    try {
      for (const [hours, file] of Object.entries(images)) {
        if (file) {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('patch_test_id', patchTestId);
          formData.append('hours_after_patch', hours);

          await api.post('/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
      }
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal open={open} onClose={!uploading ? onClose : null}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          Upload Patch Test Images
        </Typography>
        
        {uploadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {uploadError}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          <Step><StepLabel>48 Hours</StepLabel></Step>
          <Step><StepLabel>96 Hours</StepLabel></Step>
          <Step><StepLabel>7 Days</StepLabel></Step>
        </Stepper>

        <Box sx={{ mb: 3 }}>
          <input
            accept="image/*"
            type="file"
            disabled={uploading}
            onChange={(e) => handleFileChange(
              activeStep === 0 ? 48 : activeStep === 1 ? 96 : 168, 
              e.target.files[0]
            )}
          />
          {images[activeStep === 0 ? 48 : activeStep === 1 ? 96 : 168] && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              File selected
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button 
            disabled={activeStep === 0 || uploading}
            onClick={() => setActiveStep(prev => prev - 1)}
          >
            Back
          </Button>
          {activeStep < 2 ? (
            <Button 
              variant="contained" 
              disabled={uploading}
              onClick={() => setActiveStep(prev => prev + 1)}
            >
              Next
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="success" 
              disabled={uploading}
              onClick={handleUpload}
            >
              {uploading ? 'Uploading...' : 'Complete Upload'}
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
}