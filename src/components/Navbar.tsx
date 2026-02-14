import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Badge, IconButton, Container, Menu, MenuItem, Avatar, Divider, Tooltip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
        clearCart();
        navigate('/login');
    };

    const handleNavigate = (path: string) => {
        handleMenuClose();
        navigate(path);
    };

    return (
        <AppBar position="sticky" color="default" elevation={1}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ height: 80 }}>
                    <Typography
                        variant="h5"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'primary.main',
                            fontWeight: 800,
                            letterSpacing: '-0.5px'
                        }}
                    >
                        Quick<span style={{ color: '#6366f1' }}>Books</span>.
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            color="primary"
                            component={Link}
                            to="/cart"
                            sx={{ mr: 1 }}
                        >
                            <Badge badgeContent={cart.length} color="secondary">
                                <ShoppingCartOutlinedIcon />
                            </Badge>
                        </IconButton>

                        {user ? (
                            <>
                                <Tooltip title="Profile settings">
                                    <IconButton
                                        onClick={handleMenuOpen}
                                        size="small"
                                        sx={{ ml: 1, border: '2px solid', borderColor: 'divider' }}
                                        aria-controls={open ? 'account-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={open ? 'true' : undefined}
                                    >
                                        <Avatar
                                            src={user.avatarUrl}
                                            sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}
                                        >
                                            {!user.avatarUrl && (user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase())}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    anchorEl={anchorEl}
                                    id="account-menu"
                                    open={open}
                                    onClose={handleMenuClose}
                                    onClick={handleMenuClose}
                                    PaperProps={{
                                        elevation: 0,
                                        sx: {
                                            overflow: 'visible',
                                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                            mt: 1.5,
                                            minWidth: 180,
                                            borderRadius: 2,
                                            '& .MuiAvatar-root': {
                                                width: 32,
                                                height: 32,
                                                ml: -0.5,
                                                mr: 1,
                                            },
                                            '&:before': {
                                                content: '""',
                                                display: 'block',
                                                position: 'absolute',
                                                top: 0,
                                                right: 14,
                                                width: 10,
                                                height: 10,
                                                bgcolor: 'background.paper',
                                                transform: 'translateY(-50%) rotate(45deg)',
                                                zIndex: 0,
                                            },
                                        },
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <Box sx={{ px: 2, py: 1.5 }}>
                                        <Typography variant="subtitle2" fontWeight="700">
                                            {user.name || 'User'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                                            {user.email}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    {user.role === 'ADMIN' && (
                                        <MenuItem onClick={() => handleNavigate('/admin')}>
                                            <AdminPanelSettingsOutlinedIcon sx={{ mr: 1, fontSize: 20 }} color="primary" />
                                            Admin Panel
                                        </MenuItem>
                                    )}
                                    <MenuItem onClick={() => handleNavigate('/orders')}>
                                        <ReceiptLongOutlinedIcon sx={{ mr: 1, fontSize: 20 }} color="primary" />
                                        My Orders
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout}>
                                        <LogoutOutlinedIcon sx={{ mr: 1, fontSize: 20 }} color="error" />
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                component={Link}
                                to="/login"
                                startIcon={<PersonOutlineOutlinedIcon />}
                                sx={{ borderRadius: 2, px: 3 }}
                            >
                                Login
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
