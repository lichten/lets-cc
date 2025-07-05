const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const gameInfoRouter = require('./api/game-info');
const statusInfoRouter = require('./api/status-info');
const itemInfoRouter = require('./api/item-info');

app.get('/', (req, res) => {
  res.json({ message: 'Deadlock Game Website API' });
});

app.use('/api/game-info', gameInfoRouter);
app.use('/api/status-info', statusInfoRouter);
app.use('/api/item-info', itemInfoRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});