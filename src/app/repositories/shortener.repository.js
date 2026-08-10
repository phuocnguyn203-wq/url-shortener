import { prisma } from "../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.ts";
import DataAccessError from "../errors/DataAccessError.js";
import AppError from "../errors/AppError.js";

export async function createShortUrl(originalUrl, userId) {
  try {
    return await prisma.shortUrl.create({
      data: {
        originalUrl: originalUrl,
        userId: userId
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === "P2003"
    ) throw new AppError(
        "User not found",
        404,
        "USER_NOT_FOUND"
      ); 

    throw new DataAccessError(
      "Failed to create shortUrl",
      { cause: error }
    );
  }
}

export async function findShortUrlById(urlId) {
  let shortUrl;
  try {
    shortUrl = await prisma.shortUrl.findUnique({
      where: { 
        id: urlId,
        is_deleted: false
      },
    });
    
  } catch (error) {
    throw new DataAccessError(
      "Failed to fetch shortUrl",
      { cause: error }
    );
  }
  if (!shortUrl) throw new AppError(
    "shortUrl not found",
    404,
    "SHORTURL_NOT_FOUND",
  );

  return shortUrl;
}

export async function softDeleteShortUrlById(urlId, userId) {
  let result;
  try {
    result = await prisma.shortUrl.updateMany({
      where: { id: urlId , userId: userId, is_deleted: false },
      data: { is_deleted: true },
    })

  } catch (error) {
    throw new DataAccessError(
      "Failed to delete shortUrl",
      { cause: error }
    );
  }

  if (result.count === 0) throw new AppError(
    "shortUrl not found",
    404,
    "SHORTURL_NOT_FOUND",
  );
  return true;

}

export async function getAllShortUrlsByUserId(userId, isDeleted=false) {
  try {
    const shortUrlsByUser = await prisma.shortUrl.findMany({
      where: { userId: userId, is_deleted: isDeleted},
    })

    return shortUrlsByUser;
  } catch (error) {
    throw new DataAccessError(
      "Failed to get shortUrls", 
      { cause: error }
    );
  }

}