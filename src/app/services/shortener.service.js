import { saveUrl, readUrl } from "../repositories/shortener.repository.js";
import { PORT } from "../../main.js";

export function convertToBase62(num) {
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

export function decodeToInt(code) {
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
  if (URL.canParse(originalUrl)) {
    const shortenedUrl = await saveUrl(originalUrl, userId);
    const code = convertToBase62(shortenedUrl.id);
    return code;
  }

  return null;
}

export async function decodeUrl(code) {
  //decode base62 to int
  //return original url
  const urlId = decodeToInt(code);
  const shortUrl = await readUrl(urlId);

  if (!shortUrl) return null;

  return shortUrl.originalUrl;
}
