import { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Box, CircularProgress, Chip, TextField, Button, Grid, Alert, IconButton, Menu, MenuItem, Snackbar, useTheme, alpha } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveIcon from '@mui/icons-material/Save';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import api from '../api/axios';

interface User {
    id: number;
    email: string;
    name?: string;
}

interface Order {
    id: number;
    userId: number;
    totalAmount: number | string;
    status: string;
    isModified?: boolean;
    user?: User;
    payment?: {
        provider: string;
        proofImageUrl?: string;
    };
    address?: {
        village: string;
        mandal: string;
        district: string;
        state: string;
        pincode: string;
    };
}

interface Log {
    id: number;
    action: string;
    details: Record<string, unknown> | string | number | boolean | null;
    ipAddress: string;
    createdAt: string;
    user?: { email: string };
}

interface Book {
    id: number;
    title: string;
    author: string;
    description: string;
    price: number | string;
    stock: number;
    category: string;
    imageUrl?: string;
}

const AdminDashboard = () => {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const [orders, setOrders] = useState<Order[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);

    // Context Menu State
    const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    // Snackbar State
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Book Form State
    const [bookForm, setBookForm] = useState({
        title: '',
        author: '',
        description: '',
        price: '',
        stock: '',
        category: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [editBookId, setEditBookId] = useState<number | null>(null);
    const [bookSuccess, setBookSuccess] = useState(''); // Keeping legacy inline alerts for form tab for now
    const [bookError, setBookError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (tab === 3) return; // Don't fetch on Form tab

            setLoading(true);
            try {
                if (tab === 0) {
                    const res = await api.get('/admin/orders');
                    setOrders(res.data);
                } else if (tab === 1) {
                    const res = await api.get('/admin/logs');
                    setLogs(res.data);
                } else if (tab === 2) {
                    const res = await api.get('/books');
                    setBooks(res.data);
                }
            } catch (error) {
                console.error(error);
                showSnackbar('Failed to fetch data', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tab]);

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>, orderId: number) => {
        setStatusMenuAnchor(event.currentTarget);
        setSelectedOrderId(orderId);
    };

    const handleStatusMenuClose = () => {
        setStatusMenuAnchor(null);
        setSelectedOrderId(null);
    };

    const handleStatusSelect = (newStatus: string) => {
        if (selectedOrderId) {
            setOrders(orders.map(o => o.id === selectedOrderId ? { ...o, status: newStatus, isModified: true } : o));
        }
        handleStatusMenuClose();
    };

    const saveStatus = async (orderId: number, status: string) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status });
            setOrders(orders.map(o => o.id === orderId ? { ...o, isModified: false } : o));
            showSnackbar('Status updated successfully');
        } catch (err) {
            console.error('Failed to update status', err);
            showSnackbar('Failed to save status', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'PAID': return 'info';
            case 'SHIPPED': return 'primary';
            case 'DELIVERED': return 'success';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    const handleBookSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBookError('');
        setBookSuccess('');

        try {
            const formData = new FormData();
            formData.append('title', bookForm.title);
            formData.append('author', bookForm.author);
            formData.append('description', bookForm.description);
            formData.append('price', bookForm.price);
            formData.append('stock', bookForm.stock);
            formData.append('category', bookForm.category);

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (editBookId) {
                await api.put(`/books/${editBookId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showSnackbar('Book updated successfully');
                setBookSuccess('Book updated successfully!');
            } else {
                await api.post('/books', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showSnackbar('Book added successfully');
                setBookSuccess('Book added successfully!');
            }

            setBookForm({
                title: '',
                author: '',
                description: '',
                price: '',
                stock: '',
                category: ''
            });
            setImageFile(null);
            setEditBookId(null);
        } catch (err: unknown) {
            let msg = 'Failed to save book';
            if (err && typeof err === 'object' && 'response' in err) {
                const response = (err as { response?: { data?: { message?: string, errors?: { message: string }[] } } }).response;
                msg = response?.data?.message ||
                    (response?.data?.errors ? response.data.errors.map((e: { message: string }) => e.message).join(', ') : 'Failed to save book');
            }
            setBookError(msg);
            showSnackbar(msg, 'error');
        }
    };

    const handleBookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBookForm({ ...bookForm, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleEditClick = (book: Book) => {
        setBookForm({
            title: book.title,
            author: book.author,
            description: book.description || '',
            price: String(book.price),
            stock: String(book.stock),
            category: book.category || ''
        });
        setEditBookId(book.id);
        setTab(3); // Switch to Form tab
        setBookSuccess('');
        setBookError('');
    };

    const handleDeleteClick = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;
        try {
            await api.delete(`/books/${id}`);
            setBooks(books.filter(b => b.id !== id));
            showSnackbar('Book deleted successfully');
        } catch (error) {
            console.error(error);
            showSnackbar('Failed to delete book', 'error');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="800" sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Admin Dashboard
                </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                    <Tab label="All Orders" icon={<CircleIcon fontSize="small" color={tab === 0 ? 'primary' : 'disabled'} />} iconPosition="start" />
                    <Tab label="Security Logs" icon={<CircleIcon fontSize="small" color={tab === 1 ? 'primary' : 'disabled'} />} iconPosition="start" />
                    <Tab label="Manage Inventory" icon={<CircleIcon fontSize="small" color={tab === 2 ? 'primary' : 'disabled'} />} iconPosition="start" />
                    <Tab label={editBookId ? "Edit Book" : "Add New Book"} icon={<CircleIcon fontSize="small" color={tab === 3 ? 'primary' : 'disabled'} />} iconPosition="start" />
                </Tabs>
            </Box>

            {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box> : (
                <>
                    {/* Orders Tab */}
                    <Box hidden={tab !== 0}>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableRow>
                                        <TableCell><strong>Order ID</strong></TableCell>
                                        <TableCell><strong>Customer</strong></TableCell>
                                        <TableCell><strong>Total</strong></TableCell>
                                        <TableCell><strong>Shipping Address</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Payment</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>#{order.id}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="500">{order.user?.name || 'Guest'}</Typography>
                                                <Typography variant="caption" color="text.secondary">{order.user?.email}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={`₹${order.totalAmount}`} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                                            </TableCell>
                                            <TableCell>
                                                {order.address ? (
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{order.address.village}, {order.address.mandal}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{order.address.district}, {order.address.pincode}</Typography>
                                                    </Box>
                                                ) : <Typography variant="caption" color="error">Missing Address</Typography>}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                        label={<Box sx={{ display: 'flex', alignItems: 'center' }}>{order.status} <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} /></Box>}
                                                        color={getStatusColor(order.status) as 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default'}
                                                        onClick={(e) => handleStatusMenuOpen(e, order.id)}
                                                        sx={{ fontWeight: 600, minWidth: 100, cursor: 'pointer', justifyContent: 'space-between' }}
                                                    />
                                                    {order.isModified && (
                                                        <IconButton
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => saveStatus(order.id, order.status)}
                                                            sx={{
                                                                bgcolor: 'primary.main',
                                                                color: 'white',
                                                                '&:hover': { bgcolor: 'primary.dark' },
                                                                boxShadow: 2
                                                            }}
                                                        >
                                                            <SaveIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    <Chip
                                                        label={order.payment?.provider || 'UNPAID'}
                                                        color={order.payment ? 'success' : 'default'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    {order.payment?.proofImageUrl && (
                                                        <Button
                                                            size="small"
                                                            variant="text"
                                                            color="info"
                                                            sx={{ fontSize: '0.7rem', p: 0 }}
                                                            href={order.payment.proofImageUrl}
                                                            target="_blank"
                                                        >
                                                            View Proof
                                                        </Button>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {orders.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No orders found</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    {/* Logs Tab */}
                    <Box hidden={tab !== 1}>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableRow>
                                        <TableCell><strong>Time</strong></TableCell>
                                        <TableCell><strong>User</strong></TableCell>
                                        <TableCell><strong>Action</strong></TableCell>
                                        <TableCell><strong>Details</strong></TableCell>
                                        <TableCell><strong>IP</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString()}</TableCell>
                                            <TableCell>{log.user?.email || 'Anonymous'}</TableCell>
                                            <TableCell><Chip label={log.action} size="small" sx={{ fontWeight: 500 }} /></TableCell>
                                            <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                {JSON.stringify(log.details)}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.85rem' }}>{log.ipAddress}</TableCell>
                                        </TableRow>
                                    ))}
                                    {logs.length === 0 && <TableRow><TableCell colSpan={5} align="center">No logs found</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    {/* Inventory Tab */}
                    <Box hidden={tab !== 2}>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={() => { setEditBookId(null); setBookForm({ title: '', author: '', description: '', price: '', stock: '', category: '' }); setTab(3); }}>
                                Add New Book
                            </Button>
                        </Box>
                        <Grid container spacing={2}>
                            {books.map((book) => (
                                <Grid item xs={12} key={book.id}>
                                    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: '0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: 1 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box
                                                component="img"
                                                src={book.imageUrl || 'https://via.placeholder.com/50'}
                                                alt={book.title}
                                                sx={{ width: 50, height: 75, objectFit: 'cover', borderRadius: 1 }}
                                            />
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="600">{book.title}</Typography>
                                                <Typography variant="body2" color="text.secondary">by {book.author}</Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h6" fontWeight="bold" color="primary">₹{Number(book.price).toFixed(2)}</Typography>
                                                <Typography variant="caption" color="text.secondary">Price</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Chip label={book.stock} color={book.stock > 0 ? 'success' : 'error'} size="small" />
                                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>Stock</Typography>
                                            </Box>
                                            <Box>
                                                <IconButton color="primary" onClick={() => handleEditClick(book)}>
                                                    <EditOutlinedIcon />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDeleteClick(book.id)}>
                                                    <DeleteOutlineIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                            {books.length === 0 && <Grid item xs={12}><Typography align="center" color="text.secondary">No books available</Typography></Grid>}
                        </Grid>
                    </Box>

                    {/* Add/Edit Book Tab */}
                    <Box hidden={tab !== 3}>
                        <Paper elevation={0} sx={{ p: 4, maxWidth: 800, mx: 'auto', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight="700" color="primary">
                                    {editBookId ? 'Edit Book Details' : 'Add New Book'}
                                </Typography>
                                {editBookId && (
                                    <Button variant="outlined" size="small" onClick={() => { setEditBookId(null); setBookForm({ title: '', author: '', description: '', price: '', stock: '', category: '' }); }}>
                                        Cancel Edit
                                    </Button>
                                )}
                            </Box>

                            {bookError && <Alert severity="error" sx={{ mb: 2 }}>{bookError}</Alert>}
                            {bookSuccess && <Alert severity="success" sx={{ mb: 2 }}>{bookSuccess}</Alert>}

                            <Box component="form" onSubmit={handleBookSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField required fullWidth label="Title" name="title" value={bookForm.title} onChange={handleBookChange} variant="outlined" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField required fullWidth label="Author" name="author" value={bookForm.author} onChange={handleBookChange} variant="outlined" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField required fullWidth multiline rows={3} label="Description" name="description" value={bookForm.description} onChange={handleBookChange} variant="outlined" />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField required fullWidth type="number" label="Price" name="price" value={bookForm.price} onChange={handleBookChange} InputProps={{ inputProps: { min: 0, step: 0.01 } }} />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField required fullWidth type="number" label="Stock Quantity" name="stock" value={bookForm.stock} onChange={handleBookChange} InputProps={{ inputProps: { min: 0 } }} />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField fullWidth label="Category" name="category" value={bookForm.category} onChange={handleBookChange} placeholder="e.g. Fiction" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            sx={{ height: 56, justifyContent: 'flex-start', color: imageFile ? 'success.main' : 'text.secondary', borderColor: imageFile ? 'success.main' : 'rgba(0, 0, 0, 0.23)', borderStyle: 'dashed' }}
                                        >
                                            {imageFile ? `Selected: ${imageFile.name}` : 'Upload Cover Image'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </Button>
                                        {editBookId && <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>Leave empty to keep existing image</Typography>}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2, py: 1.5, fontWeight: 'bold', boxShadow: 2 }}>
                                            {editBookId ? 'Update Book' : 'Post Book'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Box>
                </>
            )}

            {/* Global Status Menu */}
            <Menu
                anchorEl={statusMenuAnchor}
                open={Boolean(statusMenuAnchor)}
                onClose={handleStatusMenuClose}
            >
                {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                    <MenuItem key={status} onClick={() => handleStatusSelect(status)}>
                        <Chip label={status} color={getStatusColor(status) as 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default'} size="small" sx={{ minWidth: 80, cursor: 'pointer' }} />
                    </MenuItem>
                ))}
            </Menu>

            {/* Notification Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminDashboard;
