const { CustomError } = require("../error/custom_error");

const errorHandler = (err, req, res, next) => {
  console.log(err);
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      status: false,
      msg: err.message,
      data: [],
    });
  }
  return res.status(500).json({
    status: false,
    msg: err.message,
    data: [],
  });
};

module.exports = errorHandler;
