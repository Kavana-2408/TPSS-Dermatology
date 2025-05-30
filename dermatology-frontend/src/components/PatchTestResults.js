import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { ZoomIn, CloudUpload } from '@mui/icons-material';
import { uploadPatchTestImage } from '@/utils/api';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTimeLabel = (hours) => {
  switch(hours) {
    case 48: return '48 Hours';
    case 96: return '96 Hours';
    case 168: return '7 Days';
    default: return `${hours} Hours`;
  }
};

export default function PatchTestResults({ patientId }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tests, setTests] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setFetching(true);
        setError('');
        
        const apiUrl = process.env.NODE_ENV === 'development'
          ? `http://localhost:3000/api/patients/${patientId}/patch-tests`
          : `/api/patients/${patientId}/patch-tests`;
    
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
    
        const data = await response.json();
        setTests(data.patch_tests || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Failed to load data: ${err.message}`);
        setTests([]);
      } finally {
        setFetching(false);
      }
    };

    if (patientId && typeof patientId === 'string') {
      fetchPatientData();
    } else {
      setError('Invalid patient ID');
      setFetching(false);
    }
  }, [patientId, success]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setOpenDialog(true);
  };

  const handleUploadClick = (testId) => {
    setSelectedTestId(testId);
    setUploadDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedImage(null);
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedTestId) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      for (const file of files) {
        await uploadPatchTestImage(
          patientId,
          selectedTestId,
          file,
          48,
          ''
        );
      }

      setSuccess(`${files.length} image(s) uploaded successfully!`);
      setTimeout(() => setUploadDialogOpen(false), 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center',
          fontWeight: 'bold',
          color: 'primary.main'
        }}>
          Patch Test Results
          {(loading || fetching) && <CircularProgress size={20} sx={{ ml: 2 }} />}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {error}
            <Button 
              onClick={() => window.location.reload()} 
              size="small" 
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        )}

        {fetching ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 200
          }}>
            <CircularProgress />
          </Box>
        ) : tests.length === 0 ? (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
            border: '1px dashed #ddd',
            borderRadius: 1,
            p: 3
          }}>
            <Typography variant="body2" color="text.secondary">
              {error ? 'Could not load tests' : 'No patch tests available'}
            </Typography>
          </Box>
        ) : (
          tests.map((test) => (
            <Box key={test.id} sx={{ 
              mb: 4, 
              pb: 3,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Box>
                  <Typography variant="subtitle1" component="div" fontWeight="medium">
                    Test Date: {formatDate(test.test_date)}
                  </Typography>
                  {test.notes && (
                    <Typography variant="body2" color="text.secondary">
                      {test.notes}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloudUpload />}
                  onClick={() => handleUploadClick(test.id)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 1
                  }}
                >
                  Upload Images
                </Button>
              </Box>

              {test.images?.length > 0 ? (
                <ImageList 
                  cols={{ xs: 1, sm: 2, md: 3 }} 
                  gap={16}
                  sx={{
                    mx: 'auto',
                    maxWidth: '100%'
                  }}
                >
                  {test.images?.map((image) => (
                    <ImageListItem key={image.id} sx={{
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: 1,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: 3
                      }
                    }}>
                      <Box
                        component="img"
                        src={image.image_path}
                        alt={`Patch test ${getTimeLabel(image.hours_after_patch)}`}
                        loading="lazy"
                        sx={{
                          width: '100%',
                          height: 220,
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleImageClick(image)}
                        onError={(e) => {
                          console.error('Failed to load image:', image.image_path);
                          e.target.onerror = null;
                          e.target.src = '/fallback-image.jpg';
                        }}
                      />
                      <ImageListItemBar
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip 
                              label={getTimeLabel(image.hours_after_patch)} 
                              size="small" 
                              sx={{ 
                                mr: 1,
                                backgroundColor: 'primary.main',
                                color: 'white'
                              }}
                            />
                            {image.doctor_notes && (
                              <Typography variant="caption" sx={{ 
                                ml: 1,
                                color: 'white',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden'
                              }}>
                                {image.doctor_notes}
                              </Typography>
                            )}
                          </Box>
                        }
                        subtitle={
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Uploaded: {formatDate(image.created_at)}
                          </Typography>
                        }
                        actionIcon={
                          <IconButton
                            sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                            onClick={() => handleImageClick(image)}
                            size="small"
                          >
                            <ZoomIn fontSize="small" />
                          </IconButton>
                        }
                        sx={{
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)'
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 150,
                  border: '1px dashed #ddd',
                  borderRadius: 1,
                  p: 3,
                  backgroundColor: 'action.hover'
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No images available for this test
                  </Typography>
                </Box>
              )}
            </Box>
          ))
        )}
      </Paper>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          sx: { 
            maxHeight: '90vh',
            borderRadius: 2
          } 
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center' }}>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage.image_path}
              alt={`Patch test ${getTimeLabel(selectedImage.hours_after_patch)}`}
              sx={{ 
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                p: 2
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjYWFhIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="contained"
            sx={{ borderRadius: 1 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => !loading && setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Upload Patch Test Images
          </Typography>
          
          {success ? (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 1 }}>
              {success}
            </Alert>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Test: <strong>{tests.find(t => t.id === selectedTestId)?.notes || 'No description'}</strong>
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3, borderRadius: 1 }}>
                <Typography variant="body2">
                  Accepted formats: JPEG, PNG (Max 5MB each)
                </Typography>
              </Alert>

              <input
                accept="image/jpeg,image/png"
                style={{ display: 'none' }}
                id="patch-test-upload"
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={loading}
              />
              <label htmlFor="patch-test-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
                  fullWidth
                  sx={{ 
                    py: 1.5, 
                    mb: 2,
                    borderRadius: 1
                  }}
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Select Images'}
                </Button>
              </label>
            </>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 1 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setUploadDialogOpen(false)}
            disabled={loading}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            {success ? 'Done' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}