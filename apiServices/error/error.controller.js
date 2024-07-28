const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";
  //err.responseCode = err.responseCode || "07";

  res.status(err.statusCode).json({
    status: err.status,
    //responseCode: err.responseCode,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = { globalErrorHandler };
