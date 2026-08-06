import { prisma } from "../../config/db.js";
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
    const result = await prisma.shortUrl.updateMany({
      where: { id: urlId , userId: userId, is_deleted: false },
      data: { is_deleted: true },
    })

    return result.count > 0;
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }
}

export async function getAllShortUrlsByUserId(userId, isDeleted=false) {
  try {
    const shortUrlsByUser = await prisma.shortUrl.findMany({
      where: { userId: userId, is_deleted: isDeleted},
    })

    return shortUrlsByUser;
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }

}