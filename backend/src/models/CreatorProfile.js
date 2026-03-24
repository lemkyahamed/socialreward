const mongoose = require('mongoose');

const creatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    displayName: {
      type: String,
      required: [true, 'Please provide a display name']
    },
    bio: {
      type: String,
      maxlength: 500
    },
    avatarUrl: {
      type: String
    },
    country: {
      type: String
    },
    socialLinks: {
      instagram: String,
      tiktok: String,
      youtube: String,
      twitter: String
    }
  },
  {
    timestamps: true
  }
);

const CreatorProfile = mongoose.model('CreatorProfile', creatorProfileSchema);

module.exports = CreatorProfile;
