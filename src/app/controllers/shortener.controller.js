import * as shortenService from "../services/shortener.service.js";
import DataAccessError from "../errors/DataAccessError.js";
import { Errors, createAppError } from "../errors/errorDefinitions.js";

function toShortUrlDto(shortUrl) {
  const { id, is_deleted, ...leftover } = shortUrl;
  const code = shortenService.encodeBase62(id);

  return { code, ...leftover };
}

export const redirectToOriginalUrl = async (req, res) => {
  const code = req.params.code;

  /*
  Browser doesn't send If-None-Match header if response status code in range 300
  so server can't use ETag to revalidate stale cached redirect (302)
  */

  const originalUrl = await shortenService.getOriginalUrlByCode(code);

  return res.set("Cache-Control", "max-age=60").redirect(originalUrl);
};

export const createShortUrl = async (req, res) => {
  const { originalUrl } = req.body;
  const userId = req.userId;

  if (!originalUrl)
    throw createAppError(Errors.URL_REQUIRED);

  if (!originalUrl instanceof String)
    throw createAppError(Errors.URL_REQUIRED);

  if (originalUrl.trim() === "")
    throw createAppError(Errors.URL_REQUIRED);

  const code = await shortenService.shortenUrl(originalUrl, userId);

  const shortUrl = `${req.protocol}://${req.get("host")}/shortened/${code}`;
  return res.json({ shortUrl });
};

export const deleteShortUrl = async (req, res) => {
  const code = req.params.code;
  const userId = req.userId;
  const deletedUrl = await shortenService.softDeleteUrl(code, userId);
  return res.json(deletedUrl);
};

export const allMyShortUrls = async (req, res) => {
  const userId = req.userId;
  const allShortUrlsByUser = await shortenService.getAllMyShortUrls(
    userId,
    false,
  );
  const alLFormatedShortUrls = allShortUrlsByUser.map((item) =>
    toShortUrlDto(item),
  );
  return res.send(alLFormatedShortUrls);
};

export const allMyDeletedShortUrls = async (req, res) => {
  const userId = req.userId;
  const allDeletedShortUrls = await shortenService.getAllMyShortUrls(
    userId,
    true,
  );
  const allFormatedShortUrls = allDeletedShortUrls.map((item) =>
    toShortUrlDto(item),
  );
  return res.send(allFormatedShortUrls);
};
