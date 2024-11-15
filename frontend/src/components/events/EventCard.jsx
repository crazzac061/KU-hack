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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ChatComponent from '../ChatComponent';

function EventCard() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openAddEventDialog, setOpenAddEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    from: '',
    to: '',
    location: '',
    participants: [],
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const handleCardClick = (event) => {
    setSelectedEvent(event);
  };

  const handleAddEvent = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/events', newEvent);
      setEvents((prevEvents) => [...prevEvents, response.data]);
      setNewEvent({
        title: '',
        description: '',
        from: '',
        to: '',
        location: '',
        participants: [],
      });
      setOpenAddEventDialog(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="#06402b">
          Event Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddEventDialog(true)}
          sx={{
            fontWeight: 'bold',
            backgroundColor: '#06402b',
            ':hover': { backgroundColor: '#115293' },
          }}
        >
          Add Event
        </Button>
      </Box>

      {/* Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'start',
        }}
      >
        {events.map((event) => (
          <Card
            key={event.id}
            sx={{
              boxShadow: 3,
              borderRadius: '8px',
              p: 2,
              transition: '0.3s',
              ':hover': { boxShadow: 6, transform: 'scale(1.02)' },
            }}
            onClick={() => handleCardClick(event)}
          >
            <CardContent>
              <Typography
                variant="subtitle1"
                color="#06402b"
                gutterBottom
                sx={{ fontWeight: 'bold', fontSize: 16 }}
              >
                {event.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                {event.description}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                <strong>From:</strong> {new Date(event.from).toLocaleDateString()} <br />
                <strong>To:</strong> {new Date(event.to).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Chat Section */}
      {selectedEvent && (
        <Box
          sx={{
            mt: 4,
            p: 3,
            border: '1px solid #ddd',
            borderRadius: '12px',
            backgroundColor: '#fff',
            position: 'relative',
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
            Chat for {selectedEvent.title}
          </Typography>
          <ChatComponent eventId={selectedEvent._id} />
        </Box>
      )}

      {/* Add Event Dialog */}
      <Dialog open={openAddEventDialog} onClose={() => setOpenAddEventDialog(false)}>
        <DialogTitle>Add a New Event</DialogTitle>
        <DialogContent>
          <TextField
            label="Event Title"
            fullWidth
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Event Description"
            fullWidth
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="From Date"
            type="date"
            fullWidth
            value={newEvent.from}
            onChange={(e) => setNewEvent({ ...newEvent, from: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To Date"
            type="date"
            fullWidth
            value={newEvent.to}
            onChange={(e) => setNewEvent({ ...newEvent, to: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Location"
            fullWidth
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Participants (comma separated)"
            fullWidth
            value={newEvent.participants.join(', ')}
            onChange={(e) => setNewEvent({ ...newEvent, participants: e.target.value.split(',') })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddEventDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddEvent} color="primary" variant="contained">
            Add Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EventCard;
