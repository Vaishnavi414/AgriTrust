import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProductShowcase from '../components/ProductShowcase';
import heroBg from '../assets/hero-farm.jpg';

const GRADIENT_PRIMARY = 'linear-gradient(135deg, #a8e063, #56ab2f)';
const GRADIENT_HOVER = 'linear-gradient(135deg, #b8f074, #6ab73f)';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, navigate, loading]);

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: { xs: 20, md: 30 },
          textAlign: 'center',
          minHeight: { xs: 'calc(75vh + 200px)', md: 'calc(85vh + 200px)' },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '4.2rem' },
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            AI-Powered Agri Trust
            <br />
            <Box component="span" sx={{ color: '#a8e063', fontSize: { xs: '2rem', md: '3.5rem' } }}>
              Marketplace
            </Box>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 5,
              opacity: 0.95,
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              fontWeight: 400,
            }}
          >
            Connect farmers and buyers directly with secure transactions 
            and AI-powered insights for fair trade
          </Typography>
          <Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                background: GRADIENT_PRIMARY,
                color: '#1a5c00',
                px: 5,
                py: 2,
                fontSize: '1.15rem',
                fontWeight: 700,
                borderRadius: '50px',
                boxShadow: '0 8px 30px rgba(86, 171, 47, 0.4)',
                '&:hover': {
                  background: GRADIENT_HOVER,
                  transform: 'translateY(-4px)',
                  boxShadow: '0 15px 40px rgba(86, 171, 47, 0.5)',
                },
              }}
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'rgba(255,255,255,0.8)',
                color: 'white',
                px: 5,
                py: 2,
                fontSize: '1.15rem',
                fontWeight: 700,
                borderRadius: '50px',
                borderWidth: 2,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderColor: 'white',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 30px rgba(255,255,255,0.2)',
                },
              }}
              onClick={() => navigate('/products')}
            >
              Browse Products
            </Button>
          </Box>
        </Container>
      </Box>

      <ProductShowcase />
    </Box>
  );
};

export default Home;