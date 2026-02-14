import { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert, Stepper, Step, StepLabel, Snackbar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

interface OrderItem {
    id: number;
    bookId: number;
    quantity: number;
    book: {
        title: string;
    };
}

interface Order {
    id: number;
    totalAmount: string; // Decimal comes as string often
    status: string;
    createdAt: string;
    items: OrderItem[];
    payment?: { provider: string; proofImageUrl?: string };
}

const OrderHistory = () => {
    const location = useLocation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: !!location.state?.message, message: location.state?.message || '' });

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
            <Typography variant="h4" gutterBottom>Order History</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Items</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>#{order.id}</TableCell>
                                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>₹{Number(order.totalAmount).toFixed(2)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={order.status === 'PENDING' && order.payment ? 'Awaiting Verification' : order.status}
                                        color={order.status === 'PAID' ? 'success' : order.status === 'PENDING' ? 'warning' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{order.items.length} items</TableCell>
                                <TableCell>
                                    <Stepper activeStep={['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].indexOf(order.status) + 1} alternativeLabel>
                                        {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].map((label) => (
                                            <Step key={label}>
                                                <StepLabel>{label}</StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                    {order.status === 'CANCELLED' && <Typography color="error" variant="caption">Order Cancelled</Typography>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default OrderHistory;
