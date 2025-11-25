const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./src/routes/auth'));
app.use('/professors', require('./src/routes/professors'));
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 1999;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./src/routes/auth'));
app.use('/professors', require('./src/routes/professors'));
app.use('/students', require('./src/routes/students'));
app.use('/exercises', require('./src/routes/exercises'));
app.use('/routines', require('./src/routes/routines'));

// Test route
app.get('/', (req, res) => {
    res.send('Gym Routines API Running');
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${ PORT } `);
    });
}

module.exports = app;
```
