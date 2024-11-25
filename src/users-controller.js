const express = require('express');
const router = express.Router();
const { db } = require('../firebase.js');

router.get('/', async (req, res) => {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get();

        if (snapshot.empty) {
            return res.status(404).send({ message: 'No users found' });
        }

        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({ message: 'User ID is required' });
        }

        const userRef = db.collection('users').doc(id);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const userData = req.body;

        console.log("userData", userData);

        if (!userData || Object.keys(userData).length === 0) {
            return res.status(400).send({ message: 'Invalid user data' });
        }

        // Add the "events" property with an empty array
        const userWithEvents = { ...userData, events: [] };

        const usersRef = db.collection('users');
        const newUser = await usersRef.add(userWithEvents);

        res.status(201).send({ message: 'User created', id: newUser.id });
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

        const userRef = db.collection('users').doc(id);
        await userRef.set(updateData, { merge: true });

        res.status(200).send({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({ message: 'User ID is required' });
        }

        const userRef = db.collection('users').doc(id);
        await userRef.delete();

        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.put('/:userId/attend-event/:eventId', async (req, res) => {
    try {
        const { userId, eventId } = req.params;

        if (!userId || !eventId) {
            return res.status(400).send({ message: 'User ID and Event ID are required' });
        }

        // Update the user's events array
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).send({ message: 'User not found' });
        }

        const user = userDoc.data();
        if (user.events.includes(eventId)) {
            return res.status(400).send({ message: 'User is already attending this event' });
        }

        // Add the event ID to the user's events array
        user.events.push(eventId);
        await userRef.update({ events: user.events });

        // Update the event's usersCount
        const eventRef = db.collection('events').doc(eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).send({ message: 'Event not found' });
        }

        const event = eventDoc.data();
        const updatedUsersCount = event.usersCount + 1;

        // Increment the usersCount in the event document
        await eventRef.update({ usersCount: updatedUsersCount });

        res.status(200).send({ message: 'User confirmed attendance to the event' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


module.exports = router;
