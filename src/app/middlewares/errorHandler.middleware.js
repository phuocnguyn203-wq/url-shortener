import DataAccessError from "../errors/DataAccessError.js";
export default function errorHandler(err, req, res, next) {
  if (err instanceof DataAccessError) {
    // P2025: Prisma's update/delete matched zero rows (wrong owner or nonexistent id).
    // Respond 404 for both cases so the client can't tell them apart.
    if (err.cause?.code === "P2025") {
      return res.status(404).json({ error: "Not found" });
    }

    console.error(err.cause ?? err);
    return res.status(500).json({ error: "DataAccessError" });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
}
