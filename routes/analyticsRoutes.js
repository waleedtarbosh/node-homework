const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/tasks/search', analyticsController.searchTasks);
router.get('/users', analyticsController.getUsersWithStats);
router.get('/users/:id', analyticsController.getUserAnalytics);

module.exports = router;