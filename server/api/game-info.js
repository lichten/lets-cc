const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    title: 'Deadlock',
    description: 'A competitive multiplayer third-person shooter with MOBA elements',
    features: [
      '6v6 competitive matches',
      'Unique hero abilities',
      'Lane-based gameplay',
      'Strategic item builds',
      'Team-based objectives'
    ],
    status: 'In Development'
  });
});

module.exports = router;