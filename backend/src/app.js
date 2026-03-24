const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const globalErrorHandler = require('./middleware/error');
const AppError = require('./utils/appError');

const app = express();

// Security Headers
app.use(helmet());

// CORS config
// In production, configure exact origins
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Rate limiting (basic)
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Base route for healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// Import route modules here
const authRouter = require('./routes/auth.routes');
const publicRouter = require('./routes/public.routes');
const creatorRouter = require('./routes/creator.routes');
const brandRouter = require('./routes/brand.routes');
const adminRouter = require('./routes/admin.routes');

app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter);
app.use('/api/creator', creatorRouter);
app.use('/api/brand', brandRouter);
app.use('/api/admin', adminRouter);

// Unhandled route handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
