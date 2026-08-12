import DataAccessError from "../errors/DataAccessError.js";
import AppError from "../errors/AppError.js";
export default function errorHandler(err, req, res, next) {
  if (err instanceof DataAccessError) {
    console.error(err.cause ?? err);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });

  }
  if (err instanceof AppError) {
    console.error(err);
    return res.status(err.statusCode).json({
      error: err.clientCode,
      message: err.message,
    });
  }

  console.log(err.cause ?? err);
  return res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "Something's wrong please wait"
  });

}
