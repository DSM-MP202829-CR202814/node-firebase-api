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

// Obtener usuario por email
router.get('/userByEmail/:email', async (req, res) => {
    try {
        const { email } = req.params; // Extrae el email de los parámetros de la URL

        if (!email) {
            return res.status(400).send({ message: 'Email is required' });
        }

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();

        if (snapshot.empty) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Suponemos que solo debería haber un usuario con ese email
        let user = null;
        snapshot.forEach(doc => {
            user = { id: doc.id, ...doc.data() };
        });

        res.status(200).send(user);
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

        const usersRef = db.collection('users');
        const newUser = await usersRef.add(userData);

        res.status(201).send({ message: 'User created', id: newUser.id });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.patch('/:id', async (req, res) => {
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

module.exports = router;
