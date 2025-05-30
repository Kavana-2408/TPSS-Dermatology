// components/ErrorBoundary.js
import { Component } from 'react';
import { Button, Typography, Box } from '@mui/material';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center', mt: 10 }}>
          <Typography variant="h4" color="error" gutterBottom>
            Application Error
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {this.state.error.message}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReset}
          >
            Reload Application
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}