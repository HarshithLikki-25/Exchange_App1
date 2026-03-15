import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import AddProduct from './pages/AddProduct';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import ForgotPassword from './pages/ForgotPassword';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Layout for all pages except Landing
function PageLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Helmet>
        <title>CampusXchange | College Student Marketplace</title>
        <meta name="description" content="A product exchange platform for college students." />
      </Helmet>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Landing — full-width, no container constraint */}
          <Route path="/" element={<Landing />} />

          {/* All other routes inside padded container */}
          <Route path="/market" element={<PageLayout><Home /></PageLayout>} />
          <Route path="/login" element={<PageLayout><Login /></PageLayout>} />
          <Route path="/register" element={<PageLayout><Register /></PageLayout>} />
          <Route path="/forgot-password" element={<PageLayout><ForgotPassword /></PageLayout>} />
          <Route path="/product/:id" element={<PageLayout><ProductDetail /></PageLayout>} />
          <Route path="/profile/:id" element={<PageLayout><Profile /></PageLayout>} />
          <Route path="/add-product" element={<PageLayout><PrivateRoute><AddProduct /></PrivateRoute></PageLayout>} />
          <Route path="/dashboard" element={<PageLayout><PrivateRoute><Dashboard /></PrivateRoute></PageLayout>} />
          <Route path="/favorites" element={<PageLayout><PrivateRoute><Favorites /></PrivateRoute></PageLayout>} />
          <Route path="/notifications" element={<PageLayout><PrivateRoute><Notifications /></PrivateRoute></PageLayout>} />
          <Route path="/messages" element={<PageLayout><PrivateRoute><Chat /></PrivateRoute></PageLayout>} />
          <Route path="/chat" element={<PageLayout><PrivateRoute><Chat /></PrivateRoute></PageLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
