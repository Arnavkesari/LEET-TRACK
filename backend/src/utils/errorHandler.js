import { ApiError } from "./ApiError.js";

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
    }

    // For unexpected errors
    console.error('Unexpected error:', err);
    const statusCode = err.statusCode || err.status || 500;
    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export { errorHandler };
