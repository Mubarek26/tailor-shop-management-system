const { asyncHandler } = require('../../utils/asyncHandler');

const getSummary = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'getSummary not implemented' });
});

module.exports = { getSummary };
