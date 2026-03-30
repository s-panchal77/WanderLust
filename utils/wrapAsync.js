// Utility function to wrap async route handlers and pass errors to next()
// This helps to avoid repetitive try-catch blocks in each route handler

module.exports = (fn) => {
    return  (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}