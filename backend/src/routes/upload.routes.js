const express = require('express');
const upload = require('../middleware/upload');
const { protect, restrictTo } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(protect);

// Upload campaign-related assets (Brand/Admin)
router.post('/campaign', restrictTo('brand', 'admin'), upload.single('campaign'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  const fileUrl = `/uploads/campaigns/${req.file.filename}`;
  res.status(200).json({
    status: 'success',
    data: {
      url: fileUrl
    }
  });
}));

// Upload submission proof (Creator)
router.post('/submission', restrictTo('creator'), upload.single('submission'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  const fileUrl = `/uploads/submissions/${req.file.filename}`;
  res.status(200).json({
    status: 'success',
    data: {
      url: fileUrl
    }
  });
}));

module.exports = router;
