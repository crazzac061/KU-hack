import { Event } from '../models/Event.js';  // Using named import
import User from '../models/User.js';  // Using default import
// Add a new event
const createEvent = async (req, res) => {
  const { title, description, from, to, location, participants ,visible} = req.body;

  try {
    const newEvent = new Event({
      title,
      description,
      from,
      to,
      location,
      participants,
      visible
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: 'Error creating event' });
  }
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const userId = req.query.userId
    console.log(userId)

    const user = await User.findById(userId);



    const events = await Event.find({ participants: { $in: [user.email] }, visible: true });
    console.log(events)
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
};

// Default export
export default { createEvent, getEvents };
