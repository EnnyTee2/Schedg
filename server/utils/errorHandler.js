// Custom error handler class
class ErrorHandler extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode; 
        // Send the appropriate error stack
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ErrorHandler;