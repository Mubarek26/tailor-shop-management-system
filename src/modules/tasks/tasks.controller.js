const { asyncHandler } = require('../../utils/asyncHandler');

const listTasks = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'listTasks not implemented' });
});

const createTask = asyncHandler(async (req, res) => {
  res.status(201).json({ message: 'createTask not implemented' });
});

const updateTask = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'updateTask not implemented' });
});

module.exports = { listTasks, createTask, updateTask };
