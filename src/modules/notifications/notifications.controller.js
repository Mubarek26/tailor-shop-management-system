const { asyncHandler } = require('../../utils/asyncHandler');

const listNotifications = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'listNotifications not implemented' });
});

module.exports = { listNotifications };
