require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CreatorProfile = require('../models/CreatorProfile');
const BrandProfile = require('../models/BrandProfile');
const Campaign = require('../models/Campaign');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const importData = async () => {
  try {
    await connectDB();
    logger.info('Connected to Database for seeding...');

    // Clear existing data
    await User.deleteMany();
    await CreatorProfile.deleteMany();
    await BrandProfile.deleteMany();
    await Campaign.deleteMany();
    // Add other collections if required for full cleanup

    // 1. Create Admins
    const admin = await User.create({
      email: 'admin@socialreward.com',
      passwordHash: 'password123',
      role: 'admin'
    });

    // 2. Create Brands
    const brandUser = await User.create({
      email: 'nike@brand.com',
      passwordHash: 'password123',
      role: 'brand'
    });

    await BrandProfile.create({
      userId: brandUser._id,
      companyName: 'Nike',
      website: 'https://nike.com',
      description: 'Just do it.'
    });

    const brandUser2 = await User.create({
      email: 'startup@brand.com',
      passwordHash: 'password123',
      role: 'brand'
    });

    await BrandProfile.create({
      userId: brandUser2._id,
      companyName: 'Cool Startup',
      website: 'https://startup.io',
      description: 'We make cool stuff.'
    });

    // 3. Create Creators
    const creatorUser1 = await User.create({
      email: 'creator1@tiktok.com',
      passwordHash: 'password123',
      role: 'creator'
    });

    await CreatorProfile.create({
      userId: creatorUser1._id,
      displayName: 'TikTokStar',
      bio: 'I make funny videos',
      socialLinks: { tiktok: '@tiktokstar' }
    });

    const creatorUser2 = await User.create({
      email: 'creator2@youtube.com',
      passwordHash: 'password123',
      role: 'creator'
    });

    await CreatorProfile.create({
      userId: creatorUser2._id,
      displayName: 'YouTuberGamer',
      bio: 'Gaming channel',
      socialLinks: { youtube: 'youtube.com/gamer' }
    });

    // 4. Create Campaigns
    await Campaign.create([
      {
        brandId: brandUser._id,
        title: 'Nike Summer Run UGC',
        slug: 'nike-summer-run-ugc-1',
        shortDescription: 'We need high energy running shots in the sun.',
        fullDescription: 'Looking for 15-30 second vertical videos of you running in your favorite Nike gear...',
        platform: 'tiktok',
        category: 'Sports',
        rewardType: 'fixed',
        rewardAmount: 150,
        budgetTotal: 1500,
        maxCreators: 10,
        requirements: ['Must show logo clearly', 'No competitors in frame'],
        instructions: 'Submit raw video link via Google Drive.',
        startAt: new Date(),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'live'
      },
      {
        brandId: brandUser2._id,
        title: 'Startup App Review',
        slug: 'startup-app-review-1',
        shortDescription: 'Review our new productivity app.',
        fullDescription: 'We want honest reviews of our app...',
        platform: 'youtube',
        category: 'Tech',
        rewardType: 'fixed',
        rewardAmount: 300,
        budgetTotal: 3000,
        maxCreators: 10,
        instructions: 'Submit unlisted YT link.',
        startAt: new Date(),
        endAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'live'
      }
    ]);

    logger.info('Data Imported!');
    process.exit();
  } catch (error) {
    logger.error('Error with data import:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // destroy data logic if needed, skipping for now
} else {
  importData();
}
