import DataAccessError from "./DataAccessError.js";
export default function errorHandler(err, res, req, next) {
    if (err instanceof DataAccessError) {
        console.error(err.cause ?? err);
        return res.status(500).json({ error: "DataAccessError" });
    }
    
    console.err(err);
    return res.status(500).json({ error: "Internal Server Error" });
}