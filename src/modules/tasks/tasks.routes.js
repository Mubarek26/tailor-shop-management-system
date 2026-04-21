const express = require('express');
const { listTasks, createTask, updateTask } = require('./tasks.controller');

const router = express.Router();

router.get('/', listTasks);
router.post('/', createTask);
router.put('/:id', updateTask);

module.exports = router;
