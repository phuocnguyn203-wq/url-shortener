import { shortenUrl, getOriginalUrlByCode, softDeleteUrl } from "../services/shortener.service.js";
import DataAccessError from "../errors/DataAccessError.js";

export const redirectToOriginalUrl = async (req, res) => {
  const code = req.params.code;

  /*
  Browser doesn't send If-None-Match header if response status code in range 300
  so server can't use ETag to revalidate stale cached redirect (302)
  */

  const originalUrl = await getOriginalUrlByCode(code);
  if (!originalUrl) return res.status(400).json({ error: "URL not found" });

  return res
    .set("Cache-Control", "max-age=60")
    .redirect(originalUrl);
};

export const createShortUrl = async (req, res) => {
  const { originalUrl } = req.body;
  const userId = req.userId;

  if (!originalUrl) return res.status(400).json({ error: "URL is required " });

  const code = await shortenUrl(originalUrl, userId);
  if (code === null) return res.status(400).json({ error: "Invalid URL" });

  const shortUrl = `${req.protocol}://${req.get("host")}/shortened/${code}`;
  return res.json({ shortUrl });

};

export const deleteShortUrl = async (req, res) => {
  const code = req.params.code;
  const userId = req.userId;
  const deletedUrl = await softDeleteUrl(code, userId);
  return res.json(deletedUrl);
}
