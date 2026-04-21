const { asyncHandler } = require('../../utils/asyncHandler');

const getProgress = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'getProgress not implemented' });
});

const updateProgress = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'updateProgress not implemented' });
});

module.exports = { getProgress, updateProgress };
