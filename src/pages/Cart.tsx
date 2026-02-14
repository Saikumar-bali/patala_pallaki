import React from 'react';
import { Container, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Button, Box, Paper, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, total } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography variant="h5" align="center">Your cart is empty</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button variant="contained" onClick={() => navigate('/')}>Browse Books</Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Your Cart</Typography>
            <Paper elevation={3}>
                <List>
                    {cart.map((item) => (
                        <React.Fragment key={item.id}>
                            <ListItem
                                secondaryAction={
                                    <IconButton edge="end" aria-label="delete" onClick={() => removeFromCart(item.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar src={item.imageUrl} alt={item.title} variant="square" sx={{ width: 56, height: 56, mr: 2 }} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={item.title}
                                    secondary={`₹${item.price} x ${item.quantity}`}
                                />
                                <Typography variant="h6">₹{(item.price * item.quantity).toFixed(2)}</Typography>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5">Total: ₹{total.toFixed(2)}</Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => {
                            if (!user) {
                                navigate('/login');
                            } else {
                                navigate('/checkout');
                            }
                        }}
                    >
                        Proceed to Checkout
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Cart;
