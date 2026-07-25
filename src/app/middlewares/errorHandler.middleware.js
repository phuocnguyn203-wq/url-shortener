import DataAccessError from "../errors/DataAccessError.js";
export default function errorHandler(err, req, res, next) {
  if (err instanceof DataAccessError) {
    console.error(err.cause ?? err);
    return res.status(500).json({ error: "DataAccessError" });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
}
