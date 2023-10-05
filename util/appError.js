class AppError extends Error {
  constructor(statusCode, message, customResponseCode) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.status = `${statusCode}`.startsWith("4") ? "error" : "fail";
    this.responseCode = customResponseCode;
    Error.captureStackTrace(this, this.constructor, this);
  }
}

module.exports = { AppError };
