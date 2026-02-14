import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from './theme';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import BookList from './pages/BookList';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { CartProvider } from './context/CartContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

const Layout = ({ children }: { children: React.ReactNode }) => (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
            {children}
        </Box>
    </Box>
);

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <CartProvider>
                    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
                        <Router>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<BookList />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/cart" element={<Cart />} />
                                    <Route path="/checkout" element={
                                        <ProtectedRoute>
                                            <Checkout />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/orders" element={
                                        <ProtectedRoute>
                                            <OrderHistory />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/admin" element={
                                        <ProtectedRoute>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    } />
                                </Routes>
                            </Layout>
                        </Router>
                    </GoogleOAuthProvider>
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
