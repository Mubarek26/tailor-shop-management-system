const express = require('express');
const { listNotifications } = require('./notifications.controller');

const router = express.Router();

router.get('/', listNotifications);

module.exports = router;
