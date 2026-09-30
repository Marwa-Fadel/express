const express = require('express');
const linksController = require('../controllers/links.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/links', asyncHandler(linksController.createLink));

router.get('/:code/stats', asyncHandler(linksController.getStats));
router.get('/:code', asyncHandler(linksController.redirectToOriginal));

module.exports = router;
