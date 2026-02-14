import React, { useState } from 'react';
import { Box, Button, TextField, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api from '../api/axios';

interface Address {
    id: number;
    village: string;
    mandal: string;
    district: string;
    state: string;
    pincode: string;
}

interface AddressFormProps {
    onAddressAdded: (address: Address) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({ onAddressAdded }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        village: '',
        mandal: '',
        district: '',
        state: 'Andhra Pradesh',
        pincode: ''
    });

    const fetchLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Using Nominatim for reverse geocoding
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                const data = await response.json();

                const address = data.address;
                setFormData({
                    village: address.suburb || address.village || address.neighbourhood || '',
                    mandal: address.city_district || address.town || address.county || '',
                    district: address.city || address.state_district || '',
                    state: address.state || 'Andhra Pradesh',
                    pincode: address.postcode || ''
                });
            } catch {
                setError('Failed to fetch location details. Please enter manually.');
            } finally {
                setLoading(false);
            }
        }, () => {
            setError('Location access denied. Please enter manually.');
            setLoading(false);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/addresses', formData);
            onAddressAdded(response.data);
        } catch (err: unknown) {
            let msg = 'Failed to save address';
            if (err && typeof err === 'object' && 'response' in err) {
                msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to save address';
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Add Delivery Address</Typography>

            <Button
                variant="outlined"
                startIcon={<LocationOnIcon />}
                onClick={fetchLocation}
                disabled={loading}
                sx={{ mb: 3 }}
                fullWidth
            >
                {loading ? <CircularProgress size={24} /> : 'Fetch Current Location (Auto-fill)'}
            </Button>

            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        label="Village / Street / House No"
                        value={formData.village}
                        onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="Mandal / Town"
                        value={formData.mandal}
                        onChange={(e) => setFormData({ ...formData, mandal: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="District"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="Pincode"
                        placeholder="6-digit PIN"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={loading}
                    >
                        Save & Confirm Address
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};
