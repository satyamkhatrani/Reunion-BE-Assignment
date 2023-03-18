const handleResponse = ({
  res,
  statusCode = 200,
  msg = "Success",
  data = {},
  result = 1,
}) => {
  res.status(statusCode).send({
    result,
    statusCode,
    msg,
    data,
  });
};

const handleError = ({
  res,
  statusCode = 500,
  err_msg = "Error",
  data = {},
  err = "error",
  result = 0,
}) => {
  res.status(statusCode).send({
    result,
    statusCode,
    err_msg,
    msg: err instanceof Error ? err.message : err.msg || err,
    data,
  });
};

export { handleResponse, handleError };
