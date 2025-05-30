// components/AIResultsViewer.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, CircularProgress, Paper } from '@mui/material';

export default function AIResultsViewer({ patientId }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/ai/results?patientId=${patientId}`);
        setResults(res.data);
      } catch (error) {
        console.error('Failed to fetch AI results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [patientId]);

  if (loading) return <CircularProgress />;

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        AI Analysis Results
      </Typography>
      {results ? (
        <div>
          {/* Render results */}
        </div>
      ) : (
        <Typography>No analysis results available</Typography>
      )}
    </Paper>
  );
}