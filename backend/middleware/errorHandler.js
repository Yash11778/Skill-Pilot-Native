const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if (process.env.NODE_ENV !== 'production') {
        console.error('❗ Error Handler:', err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found';
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0];
        message = field === 'email'
            ? 'An account with this email already exists.'
            : 'Duplicate value entered for a unique field.';
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join('. ');
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid or malformed token. Please log in again.';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your session has expired. Please log in again.';
    }

    // Don't leak stack traces in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Internal Server Error';
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = errorHandler;
