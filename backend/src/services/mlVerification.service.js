const AppError = require('../utils/appError');

/**
 * Calls the FastAPI ML Service to evaluate if metric increases are natural or suspicious.
 * @param {Object} payload 
 * @param {number} payload.total_views
 * @param {number} payload.total_likes
 * @param {number} payload.view_increase
 * @param {number} payload.like_increase
 * @param {number} payload.like_view_ratio
 * @param {number} payload.hours_since_last_check
 * @returns {Promise<Object>} The verified result containing prediction and verified metrics.
 */
const verifyMetricIncrease = async (payload) => {
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  const timeoutMs = process.env.ML_SERVICE_TIMEOUT_MS ? parseInt(process.env.ML_SERVICE_TIMEOUT_MS, 10) : 5000;

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${mlServiceUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new AppError(`ML Verification failed: ${response.statusText}`, 502);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AppError('ML Verification Service timed out.', 503);
    }
    throw new AppError(`ML Verification Service unreachable: ${error.message}`, 503);
  }
};

module.exports = {
  verifyMetricIncrease
};
