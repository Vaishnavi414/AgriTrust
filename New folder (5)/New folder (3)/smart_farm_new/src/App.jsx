import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WalletProvider } from './lib/WalletContext';
import { Toaster as Sonner } from './components/ui/sonner';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import ScrollProgress from './components/ScrollProgress';
import PageTransition from './components/PageTransition';
import SpatialCursor from './components/spatial/SpatialCursor';

const Index = lazy(() => import('./pages/Index'));
const Home = lazy(() => import('./pages/Home'));
const TestUserPanel = lazy(() => import('./components/TestUserPanel'));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard').then(module => ({ default: module.FarmerDashboard })));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard').then(module => ({ default: module.BuyerDashboard })));
const BiddingSystem = lazy(() => import('./pages/BiddingSystem').then(module => ({ default: module.BiddingSystem })));
const ChatbotApp = lazy(() => import('./pages/ChatbotApp'));
const AIPredictionApp = lazy(() => import('./pages/AIPredictionApp'));
const WeatherApp = lazy(() => import('./pages/WeatherApp'));
const GeoLocationApp = lazy(() => import('./pages/GeoLocationApp'));
const Products = lazy(() => import('./pages/Products').then(module => ({ default: module.default })));

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <PageTransition location={location.pathname}>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test-users" element={<TestUserPanel />} />
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
<Route path="/bidding" element={<BiddingSystem />} />
<Route path="/chatbot" element={<ChatbotApp />} />
            <Route path="/ai-prediction" element={<AIPredictionApp />} />
            <Route path="/weather" element={<WeatherApp />} />
            <Route path="/geo-location" element={<GeoLocationApp />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </Suspense>
    </PageTransition>
  );
};

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ScrollProgress />
          <SpatialCursor />
          <Router>
            <AnimatedRoutes />
          </Router>
        </TooltipProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

function Dashboard() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Incomplete</h2>
          <p className="text-gray-600 mb-6">
            Your account exists, but your profile details are missing. This can happen if your initial registration was interrupted.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => {
                localStorage.removeItem('smart-farm-auth-v2');
                window.location.href = '/register';
              }} 
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Sign Up Again
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('smart-farm-auth-v2');
                window.location.href = '/login';
              }} 
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return profile.user_type === 'farmer' ? <FarmerDashboard /> : <BuyerDashboard />;
}

export default App;
