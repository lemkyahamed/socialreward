const EarningsLedger = require('../models/EarningsLedger');
const mongoose = require('mongoose');

/**
 * Calculates current balances for a creator based on ledger entries.
 * @param {string} creatorId 
 * @returns {Promise<Object>} { available, pending, withdrawn }
 */
const getCreatorBalances = async (creatorId) => {
  const ledgers = await EarningsLedger.find({ creatorId });

  // available: cleared credits - all debits (cleared or withdrawn)
  // pending: pending credits
  // withdrawn: debit entries that are cleared/withdrawn
  
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
const createCreditEntry = async (data, session) => {
  return await EarningsLedger.create([data], { session });
};

/**
 * Creates a debit entry for withdrawals.
 */
const createDebitEntry = async (data, session) => {
  return await EarningsLedger.create([data], { session });
};

module.exports = {
  getCreatorBalances,
  getCreatorLedger,
  createCreditEntry,
  createDebitEntry
};
