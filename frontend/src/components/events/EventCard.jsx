import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ChatComponent from '../ChatComponent';
import { useTranslation } from 'react-i18next';
import '../../i18n'; // Import the i18n configuration
import { useValue } from '../../context/ContextProvider';
import { Visibility, VisibilitySharp } from '@mui/icons-material';
function EventCard() {
  const {state:{currentUser},dispatch}=useValue()
  const { t, i18n } = useTranslation(); // Translation hook
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openAddEventDialog, setOpenAddEventDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    visible:false,
    description: '',
    from: '',
    to: '',
    location: '',
    participants: [`${currentUser.email}`],
  });
  

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events?userId=${currentUser.id}`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleCardClick = (event) => {
    setSelectedEvent(event);
  };
  const handleCheckboxChange = (event) => {
    setNewEvent({ ...newEvent, visible: event.target.checked });
  };

  const handleAddEvent = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/events', newEvent);
      setEvents((prevEvents) => [...prevEvents, response.data]);
      setNewEvent({
        title: '',
        visible:false,
        description: '',
        from: '',
        to: '',
        location: '',
        participants: [`${currentUser.email}`],
      });
      setOpenAddEventDialog(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        background: 'linear-gradient(to right, #d7f8e7, #f9fffc)',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: '#06402b',
          }}
        >
          {t('eventManager')}
        </Typography>
        <Box>
          <Button
            onClick={() => i18n.changeLanguage('en')}
            sx={{
              fontWeight: 'bold',
              color: i18n.language === 'en' ? '#06402b' : '#000',
              textDecoration: i18n.language === 'en' ? 'underline' : 'none',
            }}
          >
            English
          </Button>
          <Button
            onClick={() => i18n.changeLanguage('np')}
            sx={{
              fontWeight: 'bold',
              color: i18n.language === 'np' ? '#06402b' : '#000',
              textDecoration: i18n.language === 'np' ? 'underline' : 'none',
            }}
          >
            नेपाली
          </Button>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddEventDialog(true)}
          sx={{
            fontWeight: 'bold',
            backgroundColor: '#06402b',
            color: '#fff',
            borderRadius: '25px',
            padding: '10px 20px',
            ':hover': {
              backgroundColor: '#115293',
            },
          }}
        >
          {t('addEvent')}
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 3,
          }}
        >
          {events.map((event) => (
            <Card
              key={event.id}
              sx={{
                boxShadow: 3,
                borderRadius: '12px',
                p: 2,
                transition: 'all 0.3s ease',
                ':hover': {
                  boxShadow: 6,
                  transform: 'translateY(-5px)',
                },
                backgroundColor: '#fff',
              }}
              onClick={() => handleCardClick(event)}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  color="#06402b"
                  sx={{ fontWeight: 'bold', mb: 1 }}
                >
                  {event.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {event.description}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  <strong>{t('fromDate')}:</strong> {new Date(event.from).toLocaleDateString()} <br />
                  <strong>{t('toDate')}:</strong> {new Date(event.to).toLocaleDateString()}
                </Typography>
                
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {selectedEvent && (
        <Box
          sx={{
            mt: 4,
            p: 3,
            border: '1px solid #ddd',
            borderRadius: '12px',
            backgroundColor: '#fff',
            position: 'relative',
            boxShadow: 2,
          }}
        >
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={() => setSelectedEvent(null)}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h6"
            color="secondary"
            sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}
          >
            {t('chatFor')} {selectedEvent.title}
          </Typography>
          <ChatComponent eventId={selectedEvent._id} />
        </Box>
      )}

      <Dialog open={openAddEventDialog} onClose={() => setOpenAddEventDialog(false)}>
        <DialogTitle>{t('addANewEvent')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('eventTitle')}
            fullWidth
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('eventDescription')}
            fullWidth
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('fromDate')}
            type="date"
            fullWidth
            value={newEvent.from}
            onChange={(e) => setNewEvent({ ...newEvent, from: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label={t('toDate')}
            type="date"
            fullWidth
            value={newEvent.to}
            onChange={(e) => setNewEvent({ ...newEvent, to: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label={t('location')}
            fullWidth
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('participants')}
            fullWidth
            value={newEvent.participants.join(', ')}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                participants: e.target.value.split(',').map((p) => p.trim()),
              })
            }
            sx={{ mb: 2 }}
          />
          <FormControlLabel
          control={
            <Checkbox
              checked={newEvent.visible}
              onChange={handleCheckboxChange}
              name="visible"
              color="primary"
            />
          }
          label="Public"
        />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddEventDialog(false)}>{t('cancel')}</Button>
          <Button onClick={handleAddEvent} variant="contained">
            {t('addEventButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EventCard;
