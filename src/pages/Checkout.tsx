import { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Alert, Grid, Divider } from '@mui/material';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AddressForm } from '../components/AddressForm';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Checkout = () => {
    const { cart, total, clearCart } = useCart();
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('MANUAL');
    const [note, setNote] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    interface Address { id: number; village: string; mandal: string; district: string; state: string; pincode: string; isDefault?: boolean }
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [step, setStep] = useState(1); // 1: Address, 2: Payment/Review

    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login');
            return;
        }
        if (user) fetchAddresses();
    }, [user, isLoading, navigate]);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/addresses');
            setAddresses(response.data);
            const defaultAddr = response.data.find((a: { isDefault: boolean }) => a.isDefault);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        } catch {
            console.error('Failed to fetch addresses');
        }
    };

    if (isLoading) return null;

    if (!user) return null;

    if (cart.length === 0) {
        navigate('/');
        return null;
    }

    const handleCheckout = async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Create Order
            const items = cart.map(item => ({ bookId: item.id, quantity: item.quantity }));
            const orderResponse = await api.post('/orders', {
                items,
                addressId: selectedAddressId
            });
            const orderId = orderResponse.data.id;

            // 2. Process Payment (Mock)
            // 2. Process Payment
            const formData = new FormData();
            formData.append('orderId', orderId);
            formData.append('provider', paymentMethod);
            formData.append('note', note);
            if (proofFile) {
                formData.append('proof', proofFile);
            }

            await api.post('/orders/pay', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            clearCart();
            navigate('/orders', { state: { message: 'Order placed! Waiting for admin to verify payment.' } });
        } catch (err: unknown) {
            let msg = 'Checkout failed';
            if (err && typeof err === 'object' && 'response' in err) {
                msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Checkout failed';
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 800 }}>
                    {step === 1 ? 'Shipping Address' : 'Payment & Review'}
                </Typography>

                {step === 1 ? (
                    <Box>
                        {addresses.length > 0 && !showAddressForm ? (
                            <Box>
                                <Typography variant="subtitle1" gutterBottom fontWeight="600">Select Delivery Address</Typography>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    {addresses.map((addr) => (
                                        <Grid item xs={12} key={addr.id}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    borderColor: selectedAddressId === addr.id ? 'primary.main' : 'divider',
                                                    bgcolor: selectedAddressId === addr.id ? 'primary.50' : 'inherit',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { bgcolor: 'grey.50' },
                                                    position: 'relative'
                                                }}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <HomeIcon color={selectedAddressId === addr.id ? 'primary' : 'disabled'} />
                                                    <Box>
                                                        <Typography variant="body1" fontWeight="600">
                                                            {addr.village}, {addr.mandal}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {addr.district}, {addr.state} - {addr.pincode}
                                                        </Typography>
                                                    </Box>
                                                    {selectedAddressId === addr.id && (
                                                        <CheckCircleIcon color="primary" sx={{ position: 'absolute', top: 12, right: 12 }} />
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => setShowAddressForm(true)}
                                        fullWidth
                                    >
                                        Add New Address
                                    </Button>
                                    <Button
                                        variant="contained"
                                        disabled={!selectedAddressId}
                                        onClick={() => setStep(2)}
                                        fullWidth
                                    >
                                        Next
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box>
                                <AddressForm onAddressAdded={(newAddr) => {
                                    setAddresses([...addresses, newAddr]);
                                    setSelectedAddressId(newAddr.id);
                                    setShowAddressForm(false);
                                }} />
                                {addresses.length > 0 && (
                                    <Button sx={{ mt: 2 }} onClick={() => setShowAddressForm(false)}>Back to List</Button>
                                )}
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box>
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="800">SHIPPING TO</Typography>
                                <Button size="small" onClick={() => setStep(1)}>Change</Button>
                            </Box>
                            {(() => {
                                const selectedAddr = addresses.find(a => a.id === selectedAddressId);
                                return selectedAddr && (
                                    <Typography variant="body2">
                                        {selectedAddr.village}, {selectedAddr.mandal}, {selectedAddr.district}
                                    </Typography>
                                );
                            })()}
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Order Summary</Typography>
                            {cart.map(item => (
                                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                                    <Typography>{item.title} x {item.quantity}</Typography>
                                    <Typography>₹{(item.price * item.quantity).toFixed(2)}</Typography>
                                </Box>
                            ))}
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6">Total</Typography>
                                <Typography variant="h6" color="primary.main">₹{total.toFixed(2)}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    value={paymentMethod}
                                    label="Payment Method"
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <MenuItem value="MANUAL">Manual Transfer (Admin Verification)</MenuItem>
                                    <MenuItem value="TEST">Test Gateway (Instant Success)</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Payment Note / Transaction ID"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                helperText="For Manual Transfer, please enter your transaction reference."
                            />
                            {paymentMethod === 'MANUAL' && (
                                <Box sx={{ mt: 3, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
                                    <Typography variant="subtitle2" gutterBottom align="center" sx={{ mb: 2, fontWeight: 700 }}>Scan to Pay</Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'center' }}>
                                            <Box
                                                component="img"
                                                src="http://localhost:5000/qr/photo_6086708802016185969_x.jpg"
                                                alt="UPI QR Code"
                                                sx={{ width: 180, height: 180, objectFit: 'contain', borderRadius: 2, border: '1px solid #ddd' }}
                                            />
                                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                                                Scan with any UPI App
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: { xs: 'flex', sm: 'none' }, width: '100%', flexDirection: 'column', gap: 2 }}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                fullWidth
                                                size="large"
                                                href={`upi://pay?pa=saikumarbali555@okaxis&pn=FatalaFallaki&am=${total.toFixed(2)}&cu=INR`}
                                                target="_blank"
                                            >
                                                Pay via UPI App
                                            </Button>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 3 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            sx={{ borderStyle: 'dashed' }}
                                        >
                                            {proofFile ? proofFile.name : "Upload Payment Screenshot"}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setProofFile(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleCheckout}
                            disabled={loading}
                            sx={{ py: 2, fontSize: '1.2rem', fontWeight: 800 }}
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default Checkout;
