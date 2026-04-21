const express = require('express');
const { getDesign, createDesign, updateDesign } = require('./designs.controller');

const router = express.Router();

router.get('/:orderId', getDesign);
router.post('/', createDesign);
router.put('/:id', updateDesign);

module.exports = router;
