const { asyncHandler } = require('../../utils/asyncHandler');

const search = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'search not implemented' });
});

module.exports = { search };
