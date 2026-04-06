const EarningsLedger = require('../models/EarningsLedger');
const mongoose = require('mongoose');

/**
 * Calculates current balances for a creator based on ledger entries.
 * Rules (per USER PART 3):
 * - credit + cleared contributes to available
 * - credit + pending contributes to pending
 * - debit (any non-failed) reduces available
 * - debit + withdrawn contributes to withdrawn
 * @param {string} creatorId 
 * @returns {Promise<Object>} { available, pending, withdrawn }
 */
const getCreatorBalances = async (creatorId) => {
  const ledgers = await EarningsLedger.find({ creatorId });

  const totalClearedCredits = ledgers
    .filter(l => l.transactionType === 'credit' && l.status === 'cleared')
    .reduce((sum, l) => sum + l.amount, 0);
    
  const totalPendingCredits = ledgers
    .filter(l => l.transactionType === 'credit' && l.status === 'pending')
    .reduce((sum, l) => sum + l.amount, 0);

  const totalDebits = ledgers
    .filter(l => l.transactionType === 'debit' && l.status !== 'failed')
    .reduce((sum, l) => sum + l.amount, 0);

  const totalWithdrawn = ledgers
    .filter(l => l.transactionType === 'debit' && l.status === 'withdrawn')
    .reduce((sum, l) => sum + l.amount, 0);

  return {
    available: Number((totalClearedCredits - totalDebits).toFixed(2)),
    pending: Number(totalPendingCredits.toFixed(2)),
    withdrawn: Number(totalWithdrawn.toFixed(2))
  };
};

/**
 * Returns the full ledger history for a creator.
 */
const getCreatorLedger = async (creatorId) => {
  return await EarningsLedger.find({ creatorId })
    .populate('campaignId', 'title slug')
    .sort({ createdAt: -1 });
};

/**
 * Creates a credit entry for earnings.
 */
const createLedgerCredit = async (data, session) => {
  const entry = await EarningsLedger.create([ {
    ...data,
    transactionType: 'credit'
  } ], { session });
  return entry[0];
};

/**
 * Creates a debit entry for withdrawals.
 */
const createLedgerDebit = async (data, session) => {
  const entry = await EarningsLedger.create([ {
    ...data,
    transactionType: 'debit'
  } ], { session });
  return entry[0];
};

/**
 * Returns a 6-month historical aggregation of cleared earnings.
 */
const getRecentEarningsChart = async (creatorId) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const earningsAggregation = await EarningsLedger.aggregate([
    {
      $match: {
        creatorId: new mongoose.Types.ObjectId(creatorId),
        transactionType: 'credit',
        status: { $in: ['cleared', 'withdrawn'] },
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        amount: { $sum: "$amount" }
      }
    }
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const recentEarnings = [];
  
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    
    const found = earningsAggregation.find(a => a._id.month === m && a._id.year === y);
    recentEarnings.push({
      month: monthNames[m - 1],
      amount: found ? Number(found.amount.toFixed(2)) : 0
    });
  }

  return recentEarnings;
};

/**
 * Returns a unified financial summary including all balances and total lifetime earnings.
 */
const getCreatorFinancialSummary = async (creatorId) => {
  const balances = await getCreatorBalances(creatorId);
  return {
    ...balances,
    totalEarned: Number((balances.available + balances.withdrawn).toFixed(2))
  };
};

module.exports = {
  getCreatorBalances,
  getCreatorLedger,
  getRecentEarningsChart,
  getCreatorFinancialSummary,
  createLedgerCredit,
  createLedgerDebit
};
