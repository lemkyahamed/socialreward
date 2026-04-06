const mongoose = require('mongoose');

const brandProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    companyName: {
      type: String,
      required: [true, 'Please provide a company name']
    },
    logoUrl: {
      type: String
    },
    website: {
      type: String
    },
    description: {
      type: String,
      maxlength: 1000
    },
    brandName: {
      type: String
    },
    industry: {
      type: String
    },
    contactName: {
      type: String
    },
    contactEmail: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isOnboarded: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const BrandProfile = mongoose.model('BrandProfile', brandProfileSchema);

module.exports = BrandProfile;
