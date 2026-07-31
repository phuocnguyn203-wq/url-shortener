import { prisma } from "../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.ts";
import DataAccessError from "../errors/DataAccessError.js";

export async function createShortUrl(originalUrl, userId) {
  try {
    return await prisma.shortUrl.create({
      data: {
        originalUrl: originalUrl,
        userId: userId
      },
    });
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }
}

export async function findShortUrlById(urlId) {
  try {
    return await prisma.shortUrl.findUnique({
      where: { 
        id: urlId
      },
    });
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }
}

export async function softDeleteShortUrlById(urlId) {
  try {
    const updatedShortUrl = await prisma.shortUrl.update({
      where: { id: urlId },
      data: { is_deleted: true },
    })

    return updatedShortUrl;
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }
}