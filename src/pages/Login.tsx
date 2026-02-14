import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Box, Paper, Alert, Avatar } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { GoogleLogin } from '@react-oauth/google';
import Divider from '@mui/material/Divider';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && user) {
            navigate('/');
        }
    }, [user, isLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.user);
            navigate('/');
        } catch (err: unknown) {
            let msg = 'Login failed';
            if (err && typeof err === 'object' && 'response' in err) {
                msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed';
            }
            setError(msg);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        setError('');
        try {
            const response = await api.post('/auth/google', {
                tokenId: credentialResponse.credential
            });
            login(response.data.user);
            navigate('/');
        } catch (err: unknown) {
            let msg = 'Google login failed';
            if (err && typeof err === 'object' && 'response' in err) {
                msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Google login failed';
            }
            setError(msg);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '80vh', display: 'flex', alignItems: 'center' }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    borderRadius: 3
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5" fontWeight="700">
                    Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Sign in to continue to QuickBooks
                </Typography>

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        variant="outlined"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mt: 4, mb: 2, height: 48 }}
                    >
                        Sign In
                    </Button>

                    <Divider sx={{ my: 2 }}>OR</Divider>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            useOneTap
                            theme="filled_blue"
                            shape="pill"
                        />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <Typography variant="body2" color="primary" fontWeight="500">
                                Don't have an account? Sign Up
                            </Typography>
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
