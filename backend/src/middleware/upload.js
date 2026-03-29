const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError');

// Ensure upload directories exist
const uploadDir = 'uploads';
const campaignDir = path.join(uploadDir, 'campaigns');
const submissionDir = path.join(uploadDir, 'submissions');

[uploadDir, campaignDir, submissionDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'campaign') {
      cb(null, campaignDir);
    } else if (file.fieldname === 'submission') {
      cb(null, submissionDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|mp4|mov|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new AppError('Format not supported. Only images and videos are allowed.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

module.exports = upload;
