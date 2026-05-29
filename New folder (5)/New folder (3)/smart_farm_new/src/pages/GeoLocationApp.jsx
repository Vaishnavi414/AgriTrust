import { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const GeoLocationApp = () => {
  const [iframeError, setIframeError] = useState(false);
  const navigate = useNavigate();

  if (iframeError) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          p: 3,
        }}
      >
        <Paper
          sx={{
            p: 4,
            maxWidth: 500,
            textAlign: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            Geo Location Server Not Running
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Start the farm-measure-pro server on port 8081.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f5',
      }}
    >
      <iframe
        src="http://localhost:8081"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Geo Location Farm Measurer"
        onError={() => setIframeError(true)}
      />
    </Box>
  );
};

export default GeoLocationApp;