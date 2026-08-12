import * as shortenerRepo from '../repositories/shortener.repository.js';
import { Errors, createAppError } from "../errors/errorDefinitions.js";

export function encodeBase62(num) {
  const ALPHABET =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (num === 0) return ALPHABET[0];
  let code = "";
  while (num > 0) {
    code = ALPHABET[num % 62] + code;
    num = Math.floor(num / 62);
  }
  return code;
}

export function decodeBase62(code) {
  const ALPHABET =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let num = 0;
  for (let i = 0; i < code.length; i++) {
    num +=
      ALPHABET.indexOf(code[i]) *
      Math.pow(ALPHABET.length, code.length - i - 1);
  }
  return num;
}

export async function shortenUrl(originalUrl, userId) {
  //insert url to db, convert its id in db to base62
  //return shortened url
  const url = URL.parse(originalUrl);

  if (!url || !["http:", "https:"].includes(url.protocol))
    throw createAppError(Errors.INVALID_URL)

  const shortenedUrl = await shortenerRepo.createShortUrl(originalUrl, userId);
  const code = encodeBase62(shortenedUrl.id);
  return code;
}

export async function getOriginalUrlByCode(code) {
  //decode base62 to int
  //return original url
  const urlId = decodeBase62(code);
  const shortUrl = await shortenerRepo.findShortUrlById(urlId);

  if (!shortUrl)
    throw createAppError(Errors.SHORT_URL_NOT_FOUND);

  return shortUrl.originalUrl;
}

export async function softDeleteUrl(code, userId) {
  const urlId = decodeBase62(code);
  const is_deleted = await shortenerRepo.softDeleteShortUrlById(urlId, userId);

  return is_deleted;
}

export async function getAllMyShortUrls(userId, isDeleted=false) {
  return await shortenerRepo.getAllShortUrlsByUserId(userId, isDeleted);  
}
