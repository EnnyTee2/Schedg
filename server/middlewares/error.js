// Handle specific errors
export default  (err, req, res, next) => {

    // set default error code/ set error code
    err.statusCode = err.statusCode || 500;

    // Handle development errors, show full stack trace
    if(process.env.NODE_ENV === 'DEVELOPMENT') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errorMessage: err.message,
            errorStack: err.stack,
        })
    }

    // handle Production errors
    if(process.env.NODE_ENV === 'PRODUCTION') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
        })
    }
}