import React, { useState } from 'react';
import { AppBar, IconButton, Typography, Container, Toolbar, Box, Button } from "@mui/material";
import MenuIconSharp from '@mui/icons-material/MenuSharp';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

import UserIcons from './user/UserIcons';
import { useValue } from '../context/ContextProvider';
import Sidebar from './sidebar/Sidebar';

const NavBar = () => {
    const { state: { currentUser }, dispatch } = useValue();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLoginClick = () => {
        dispatch({ type: 'OPEN_LOGIN' });
        navigate('/login');
    };

    return (
        <>
            <AppBar position="fixed" sx={{ backgroundColor: '#06402b', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <Container maxWidth='lg'>
                    <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                            <IconButton size='large' color='inherit' onClick={() => setIsOpen(true)}>
                                <MenuIconSharp />
                            </IconButton>
                        </Box>
                        <Typography
                            variant='h6'
                            component='h1'
                            noWrap
                            sx={{
                                fontFamily: 'Arial, sans-serif',
                                fontWeight: 700,
                                letterSpacing: '.1rem',
                                textTransform: 'uppercase',
                                color: '#fff',
                                flexGrow: 1,
                                textAlign: { xs: 'center', md: 'center' },
                            }}
                        >
                            गन्तव्य
                        </Typography>
                        {!currentUser ? (
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#ffffff',
                                    color: '#06402b',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5',
                                    },
                                }}
                                startIcon={<LockIcon />}
                                onClick={handleLoginClick}
                            >
                                Login
                            </Button>
                        ) : (
                            <UserIcons />
                        )}
                    </Toolbar>
                </Container>
            </AppBar>
            <Toolbar />
            <Sidebar {...{ isOpen, setIsOpen }} />
        </>
    );
};

export default NavBar;
