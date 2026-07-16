const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');

router.get('/', roomController.getCategories);

module.exports = router;
