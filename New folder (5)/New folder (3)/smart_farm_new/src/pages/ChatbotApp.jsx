import { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ChatbotApp = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'http://localhost:3000') return;
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

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
            Chatbot Server Not Running or Invalid API Key
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            To use the chatbot:
          </Typography>
          <ol style={{ textAlign: 'left', mb: 2 }}>
            <li>Get a Groq API key from <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">console.groq.com</a></li>
            <li>Create a <code>.env</code> file in the chatbot folder with:
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: '#f5f5f5',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  mt: 1,
                  mb: 1,
                }}
              >
                GROQ_API_KEY=your_api_key_here
              </Paper>
            </li>
            <li>Run: <code>npm start</code> in the chatbot folder</li>
          </ol>
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
        src="http://localhost:3000"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '0',
        }}
        title="Agri Trust Chatbot"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </Box>
  );
};

export default ChatbotApp;
