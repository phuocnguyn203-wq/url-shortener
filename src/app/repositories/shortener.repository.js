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
        id: urlId,
        is_deleted: false
      },
    });
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }
}

export async function softDeleteShortUrlById(urlId, userId) {
  try {
    const updatedShortUrl = await prisma.shortUrl.update({
      where: { id: urlId , userId: userId},
      data: { is_deleted: true },
    })

    return updatedShortUrl;
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }
}

export async function getAllShortUrlsByUserId(userId) {
  try {
    const shortUrlsByUser = await prisma.shortUrl.findMany({
      where: { userId: userId, is_deleted: false},
    })

    return shortUrlsByUser;
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }

}