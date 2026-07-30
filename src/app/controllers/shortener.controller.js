import { shortenUrl, decodeUrl } from "../services/shortener.service.js";
import DataAccessError from "../errors/DataAccessError.js";

export const getOriginal = async (req, res) => {
  const code = req.params.code;

  try {
    const originalUrl = await decodeUrl(code);
    if (!originalUrl) 
      return res.status(400).json({ error: "URL not found" });

    return res.set(
      'Cache-Control', 
      'max-age=60'
    ).redirect(originalUrl);

  } catch (error) {
    if (error instanceof DataAccessError) {
      console.log(error.cause);
      return res.status(500).json({ error: "DataAccessError" });
    }
  }
};

export const create = async (req, res) => {
  const { originalUrl } = req.body;
  const userId = req.userId;

  if (!originalUrl) return res.status(400).json({ error: "URL is required " });
  try {
    const code = await shortenUrl(originalUrl, userId);
    if (code === null) return res.status(400).json({ error: "Invalid URL" });

    const shortUrl = `${req.protocol}://${req.get("host")}/shortened/${code}`;
    return res.json({ shortUrl });
  } catch (error) {
    if (error instanceof DataAccessError) {
      console.log(error.cause);
      return res.status(500).json({ error: "DataAccessError" });
    }
  }
};
