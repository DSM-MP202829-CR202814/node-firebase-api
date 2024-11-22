const express = require('express');
const router = express.Router();
const { db } = require('../firebase.js');

router.get('/', async (req, res) => {
    try {
        const eventsRef = db.collection('events');
        const snapshot = await eventsRef.get();

        if (snapshot.empty) {
            return res.status(404).send({ message: 'No events found' });
        }

        const events = [];
        snapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).send(events);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
  try {
      const { id } = req.params;

      if (!id) {
          return res.status(400).send({ message: 'Event ID is required' });
      }

      const eventRef = db.collection('events').doc(id);
      const doc = await eventRef.get();

      if (!doc.exists) {
          return res.status(404).send({ message: 'Event not found' });
      }

      res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
});

router.post('/', async (req, res) => {
    try {
        const eventData = req.body;

        console.log("eventData", eventData)

        if (!eventData || Object.keys(eventData).length === 0) {
            return res.status(400).send({ message: 'Invalid event data' });
        }

        const eventsRef = db.collection('events');
        const newEvent = await eventsRef.add(eventData);

        res.status(201).send({ message: 'Event created', id: newEvent.id });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id || !updateData || Object.keys(updateData).length === 0) {
            return res.status(400).send({ message: 'Invalid input' });
        }

        const eventRef = db.collection('events').doc(id);
        await eventRef.set(updateData, { merge: true });

        res.status(200).send({ message: 'Event updated successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({ message: 'Event ID is required' });
        }

        const eventRef = db.collection('events').doc(id);
        await eventRef.delete();

        res.status(200).send({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
