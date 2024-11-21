const express = require('express');
const app = express();
const port = 8383;

// Import the event controller
const eventsController = require('./src/events-controller');
const usersController = require('./src/users-controller');

// Middleware
app.use(express.json());

app.get('/', async (req, res) => {
    try {
        res.status(200).send("HELLO WORLD");
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Routes
app.use('/events', eventsController);
app.use('/users', usersController);

// Fallback for incorrect URLs
app.use((req, res) => {
    res.status(404).send({ error: 'Incorrect URL request. Please check the API documentation.' });
});

// Start the server
app.listen(port, () => console.log(`Server is running on port: ${port}`));
