import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Button, Container, CircularProgress, Box, Snackbar, Alert, Chip, Stack } from '@mui/material';
import api from '../api/axios';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';

interface Book {
    id: number;
    title: string;
    author: string;
    description: string;
    price: number;
    imageUrl: string;
    stock: number;
    category?: string;
}

const BookList = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notification, setNotification] = useState('');

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await api.get('/books');
                setBooks(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load books');
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const handleAddToCart = (book: Book) => {
        if (!user) {
            setNotification('Please login to add to cart');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }
        addToCart(book);
        setNotification(`Added "${book.title}" to cart`);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress size={60} /></Box>;
    if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: { xs: 8, md: 12 },
                    mb: 8,
                    borderRadius: { xs: 0, md: '0 0 50px 50px' },
                    background: 'linear-gradient(135deg, #0F172A 0%, #1e293b 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Stack spacing={4} sx={{ maxWidth: 700 }}>
                        <Typography variant="h2" component="h1" fontWeight="800" sx={{ letterSpacing: '-1px', fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                            Discover Your Next <br />
                            <Box component="span" sx={{ color: 'secondary.main' }}>Great Adventure</Box>
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'grey.300', lineHeight: 1.6, fontWeight: 400 }}>
                            Curated collection of bestsellers, classics, and hidden gems.
                            Delivered to your doorstep with our express quick commerce service.
                        </Typography>
                        <Box>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                sx={{ py: 1.5, px: 4, borderRadius: 50, fontSize: '1.1rem' }}
                                onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Start Browsing
                            </Button>
                        </Box>
                    </Stack>
                </Container>

                {/* Decorative Circle */}
                <Box sx={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.03)'
                }} />
            </Box>

            <Container maxWidth="lg" id="collection">
                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <Box>
                        <Typography variant="overline" color="secondary.main" fontWeight="700" letterSpacing={2}>
                            Curated List
                        </Typography>
                        <Typography variant="h4" component="h2" fontWeight="700" color="text.primary">
                            Featured Books
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {books.map((book) => (
                        <Grid item key={book.id} xs={12} sm={6} md={3}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                {book.stock <= 0 && (
                                    <Chip
                                        label="Out of Stock"
                                        color="error"
                                        size="small"
                                        sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1, fontWeight: 'bold' }}
                                    />
                                )}
                                <Box sx={{ p: 2, pb: 0, position: 'relative' }}>
                                    <CardMedia
                                        component="img"
                                        height="340"
                                        image={book.imageUrl || 'https://via.placeholder.com/200x300?text=No+Cover'}
                                        alt={book.title}
                                        sx={{ borderRadius: 2, objectFit: 'cover', boxShadow: '0 8px 16px -4px rgb(0 0 0 / 0.1)' }}
                                    />
                                </Box>
                                <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                                    <Typography variant="caption" color="secondary.main" fontWeight="600" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                        {book.category || 'Bestseller'}
                                    </Typography>
                                    <Typography gutterBottom variant="h6" component="h3" fontWeight="700" sx={{ lineHeight: 1.3, mb: 0.5 }}>
                                        {book.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        by {book.author}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2 }}>
                                        <Typography variant="h5" color="text.primary" fontWeight="800">
                                            ₹{Number(book.price).toFixed(2)}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleAddToCart(book)}
                                            disabled={book.stock <= 0}
                                            sx={{
                                                minWidth: 40,
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                p: 0,
                                                bgcolor: book.stock <= 0 ? 'action.disabledBackground' : 'primary.main',
                                                '&.Mui-disabled': {
                                                    bgcolor: 'grey.300',
                                                    color: 'grey.500'
                                                }
                                            }}
                                        >
                                            {book.stock <= 0 ? <RemoveShoppingCartIcon fontSize="small" /> : <AddShoppingCartIcon fontSize="small" />}
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Snackbar
                    open={!!notification}
                    autoHideDuration={3000}
                    onClose={() => setNotification('')}
                    message={notification}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
            </Container>
        </Box>
    );
};

export default BookList;
