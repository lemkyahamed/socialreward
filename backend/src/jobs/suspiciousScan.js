require('dotenv').config();
const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const SuspiciousFlag = require('../models/SuspiciousFlag');
const JobLog = require('../models/JobLog');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const runSuspiciousScan = async () => {
  const jobLog = await JobLog.create({
    jobName: 'SuspiciousSubmissionScan',
    jobType: 'CRON',
    status: 'running',
    startedAt: new Date()
  });

  try {
    logger.info('Starting suspicious submission scan...');

    // Rule 1: Duplicate content URLs across different submissions
    const aggregateDuplicates = await Submission.aggregate([
      { $match: { contentUrl: { $exists: true, $ne: null } } },
      { $group: {
          _id: "$contentUrl",
          count: { $sum: 1 },
          submissions: { $push: "$_id" }
      }},
      { $match: { count: { $gt: 1 } } }
    ]);

    let newFlagsCount = 0;

    for (const group of aggregateDuplicates) {
      for (const subId of group.submissions) {
        // Create flag if one doesn't exist already mapping this exact reason
        const existing = await SuspiciousFlag.findOne({
          submissionId: subId,
          flagType: 'DUPLICATE_URL'
        });

        if (!existing) {
          await SuspiciousFlag.create({
            submissionId: subId,
            flagType: 'DUPLICATE_URL',
            reason: `Content URL ${group._id} used in multiple submissions`,
            score: 50
          });
          
          await Submission.findByIdAndUpdate(subId, { reviewStatus: 'flagged' });
          newFlagsCount++;
        }
      }
    }

    jobLog.status = 'success';
    jobLog.finishedAt = new Date();
    jobLog.result = {
      message: 'Scan completed successfully',
      duplicateUrlGroupsFound: aggregateDuplicates.length,
      newFlagsCreated: newFlagsCount
    };
    await jobLog.save();

    logger.info(`Scan complete. Found ${newFlagsCount} new suspicious submissions.`);
  } catch (error) {
    logger.error('Error running suspicious scan:', error);
    jobLog.status = 'failed';
    jobLog.finishedAt = new Date();
    jobLog.result = { error: error.message };
    await jobLog.save();
  }
};

// If run directly via node command
if (require.main === module) {
  connectDB().then(async () => {
    await runSuspiciousScan();
    process.exit(0);
  });
}

module.exports = runSuspiciousScan;
