import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Agriculture,
  TrendingUp,
  Security,
  Psychology,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import aiFarm3 from './ai farm 3.jpeg';
import aiFarm4 from './ai farm 4.jpg';
import aiFarm5 from './ai image 5.jpg';
import aiImage from './Artificial-Intelligence.jpg';
import { motion } from 'framer-motion';
import ProductShowcase from '../components/ProductShowcase';

const GRADIENT_PRIMARY = 'linear-gradient(135deg, #a8e063, #56ab2f)';
const GRADIENT_HOVER = 'linear-gradient(135deg, #b8f074, #6ab73f)';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isHovering, setIsHovering] = useState(false);
  const [currentImage, setCurrentImage] = useState(aiFarm3);

  const images = [aiFarm3, aiFarm4, aiFarm5, aiImage];

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, navigate, loading]);

  useEffect(() => {
    if (isHovering) {
      const interval = setInterval(() => {
        setCurrentImage(prev => {
          const currentIndex = images.indexOf(prev);
          return images[(currentIndex + 1) % images.length];
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isHovering, images]);

  const features = [
    {
      icon: <Agriculture sx={{ fontSize: 48, color: '#56ab2f' }} />,
      title: 'Direct Trading',
      description: 'Connect directly with farmers and buyers without middlemen. Fair prices for everyone.',
    },
    {
      icon: <Psychology sx={{ fontSize: 48, color: '#56ab2f' }} />,
      title: 'AI-Powered Insights',
      description: 'Get yield predictions, quality grading, and price recommendations powered by AI.',
    },
    {
      icon: <Security sx={{ fontSize: 48, color: '#56ab2f' }} />,
      title: 'Blockchain Security',
      description: 'All transactions are secured on blockchain with smart contracts and automatic payments.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48, color: '#56ab2f' }} />,
      title: 'Weather Insights',
      description: 'Real-time weather data to plan farming activities.',
    },
];

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.4 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 20 }
    }
  };

  const glassCardStyles = {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  };

  return (
    <Box>
      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-bg {
          background-size: 200% 200%;
          animation: gradientShift 10s ease infinite;
        }
      `}</style>
      
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: { xs: 12, md: 18 },
          textAlign: 'center',
          background: `linear-gradient(135deg, rgba(86, 171, 47, 0.92), rgba(46, 125, 50, 0.95)), url(${currentImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundBlendMode: 'overlay',
          minHeight: { xs: '75vh', md: '85vh' },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          transition: 'background 0.8s ease-in-out',
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(168, 224, 99, 0.1) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle at 30% 30%, rgba(168, 224, 99, 0.15) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(86, 171, 47, 0.1) 0%, transparent 40%)',
            animation: 'pulse 8s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          style={{ position: 'relative', zIndex: 1, width: '100%' }}
        >
          <Container maxWidth="lg">
            <motion.div variants={itemVariants}>
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
            </motion.div>
            <motion.div variants={itemVariants}>
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
                Connect farmers and buyers directly with blockchain-secured transactions 
                and AI-powered insights for fair trade
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
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
            </motion.div>
          </Container>
        </motion.div>
      </Box>

      <Container maxWidth="lg" sx={{ py: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 800, mb: 1, color: '#2e7d32', letterSpacing: '-0.01em' }}
          >
             Why Choose Agri Trust?
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            sx={{ mb: 6, color: 'text.secondary', fontSize: '1.1rem' }}
          >
            Modern farming meets cutting-edge technology
          </Typography>
        </motion.div>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
              >
                <motion.div
                  whileHover={{ y: -12, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 20 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      textAlign: 'center',
                      p: 4,
                      ...glassCardStyles,
                      bgcolor: 'rgba(255, 255, 255, 0.85)',
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        boxShadow: '0 20px 50px rgba(86, 171, 47, 0.25)',
                        transform: 'translateY(-12px)',
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ mb: 2.5, p: 1.5, borderRadius: '50%', bgcolor: 'rgba(168, 224, 99, 0.2)', width: 80, height: 80, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#2e7d32', mb: 1.5 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'rgba(168, 224, 99, 0.08)', py: 12 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <Typography
              variant="h3"
              component="h2"
              textAlign="center"
              gutterBottom
              sx={{ fontWeight: 800, mb: 1, color: '#2e7d32', letterSpacing: '-0.01em' }}
            >
              Technologies in Agri Trust 
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ mb: 6, color: 'text.secondary', fontSize: '1.1rem' }}
            >
              
            </Typography>
          </motion.div>
          <Grid container spacing={4}>
            {[
              { image: aiFarm3, title: 'Direct Trading', desc: 'Connect directly with farmers and buyers without middlemen. Fair prices for everyone.' },
              { image: aiFarm4, title: 'AI-Powered Insights', desc: 'Get yield predictions, quality grading, and price recommendations powered by AI.' },
              { image: aiFarm5, title: 'Blockchain Security', desc: 'All transactions are secured on blockchain with smart contracts and automatic payments.' },
              { image: aiImage, title: 'Weather Insights', desc: 'Real-time weather data to plan farming activities and also recoomendations provided.' },
            ].map((tech, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                >
                  <motion.div
                    whileHover={{ y: -12, scale: 1.04 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 20 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        overflow: 'hidden',
                        transition: 'all 0.4s ease',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        '&:hover': {
                          boxShadow: '0 25px 60px rgba(86, 171, 47, 0.25)',
                          transform: 'translateY(-12px)',
                        }
                      }}
                    >
                      <Box
                        sx={{
                          height: '220px',
                          backgroundImage: `linear-gradient(135deg, rgba(86, 171, 47, 0.1), rgba(168, 224, 99, 0.05)), url(${tech.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          transition: 'transform 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.12)',
                          },
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#2e7d32' }}>
                          {tech.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {tech.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <ProductShowcase />

      <Box
        sx={{
          background: GRADIENT_PRIMARY,
          color: 'white',
          py: 12,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 40%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
            animation: 'pulse 6s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 800, mb: 2, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
            >
              Ready to Transform Agriculture?
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.95, textShadow: '0 1px 5px rgba(0,0,0,0.15)' }}
            >
              Join thousands of farmers and buyers already using our platform
            </Typography>
          </motion.div>
          <Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: '#56ab2f',
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: '50px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.95)',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.35)',
                  }
                }}
                onClick={() => navigate('/register')}
                endIcon={<ArrowForward />}
              >
                Start Trading Today
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.8)',
                  color: 'white',
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: '50px',
                  borderWidth: 2,
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderColor: 'white',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 15px 40px rgba(255,255,255,0.25)',
                  }
                }}
                onClick={() => navigate('/products')}
              >
                Explore Marketplace
              </Button>
            </motion.div>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;