const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const apiRouter = express.Router();
apiRouter.use('/auth', require('./src/routes/auth'));
apiRouter.use('/professors', require('./src/routes/professors'));
apiRouter.use('/students', require('./src/routes/students'));
apiRouter.use('/exercises', require('./src/routes/exercises'));
apiRouter.use('/routines', require('./src/routes/routines'));

app.use('/api', apiRouter);

// Test route
app.get('/', (req, res) => {
    res.send('Gym Routines API Running');
});

module.exports = app;
