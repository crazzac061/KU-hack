import React, { useState } from 'react';
import {
  Avatar,
  Card,
  Container,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Rating,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  Box,
  IconButton,
} from '@mui/material';
import { Search, StarBorder } from '@mui/icons-material';
import { useValue } from '../../context/ContextProvider';

const TrailsInfo = () => {
  const {
    state: { filteredTrails },
    dispatch,
  } = useValue();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter trails based on the search query
  const visibleTrails = filteredTrails.filter((trail) =>
    trail.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #e0f7fa, #f1f8e9)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Container sx={{ py: 6 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search trails by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <Search sx={{ color: '#757575' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 600,
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: '#ffffff',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                paddingRight: '8px',
                transition: 'transform 0.3s, box-shadow 0.3s',
                transform: 'scale(1)',
                '&:hover': {
                  transform: 'scale(0.98)', // Shrinks slightly on hover
                  boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.2)',
                },
              },
            }}
          />
        </Box>

        {/* Trails List */}
        <ImageList
          gap={24}
          sx={{
            gridTemplateColumns: {
              xs: 'repeat(auto-fill, minmax(240px, 1fr))',
              sm: 'repeat(auto-fill, minmax(280px, 1fr))',
              md: 'repeat(auto-fill, minmax(300px, 1fr))',
            },
            overflow: 'hidden',
          }}
        >
          {visibleTrails.map((trail) => (
            <Card
              key={trail._id}
              elevation={5}
              sx={{
                borderRadius: '20px',
                overflow: 'hidden',
                height: 420,
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.4s, box-shadow 0.4s',
                transform: 'scale(1)',
                '&:hover': {
                  transform: 'scale(0.96)', // Shrinks slightly on hover
                  boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <ImageListItem sx={{ height: '100%', flexGrow: 1 }}>
                <ImageListItemBar
                  sx={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 100%)',
                    padding: '8px 12px',
                  }}
                  title={
                    <Typography  sx={{ fontWeight: 'bold', color: '#fff' }}>
                      {trail.price === 0 ? 'Free Stay' : `$${trail.price}`}
                    </Typography>
                  }
                  actionIcon={
                    <Tooltip title={trail.uName} sx={{ mr: '8px' }}>
                      <Avatar src={trail.uPhoto} sx={{ width: 36, height: 36, border: '2px solid #ffffff' }} />
                    </Tooltip>
                  }
                  position="top"
                />
                <img
                  src={trail.images[0][0]}
                  alt={trail.title}
                  loading="lazy"
                  style={{
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.9)',
                    transition: 'filter 0.3s ease',
                  }}
                  onClick={() => dispatch({ type: 'UPDATE_TRAIL', payload: trail })}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(0.9)')}
                />
                <ImageListItemBar
                  sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)',
                  }}
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 500, color: '#333' }}>
                      {trail.title}
                    </Typography>
                  }
                  actionIcon={
                    <Rating
                      sx={{ color: '#ffd700', mr: '8px' }}
                      name="trail-rating"
                      defaultValue={trail.rating || 3.5}
                      precision={0.5}
                      emptyIcon={<StarBorder sx={{ color: '#ffd700' }} />}
                    />
                  }
                />
              </ImageListItem>
            </Card>
          ))}
        </ImageList>

        {/* No Results Message */}
        {visibleTrails.length === 0 && (
          <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: '#757575' }}>
            No trails found matching your search.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default TrailsInfo;
