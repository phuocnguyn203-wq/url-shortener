import { prisma } from "../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.ts";
import { DataAccessError, createDataAccessError } from "../errors/DataAccessError.js";
import { Errors, createAppError } from "../errors/errorDefinitions.js";

export async function createShortUrl(originalUrl, userId) {
  try {
    return await prisma.shortUrl.create({
      data: {
        originalUrl: originalUrl,
        userId: userId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    )
      throw createAppError(Errors.USER_NOT_FOUND);

    throw createDataAccessError("Failed to create shortUrl", { cause: error });
  }
}

export async function findShortUrlById(urlId) {
  try {
    const shortUrl = await prisma.shortUrl.findUnique({
      where: {
        id: urlId,
        is_deleted: false,
      },
    });
    return shortUrl;
  } catch (error) {
    throw createDataAccessError("Failed to fetch shortUrl", { cause: error });
  }
}

export async function softDeleteShortUrlById(urlId, userId) {
  try {
    const result = await prisma.shortUrl.updateMany({
      where: { id: urlId, userId: userId, is_deleted: false },
      data: { is_deleted: true },
    });
    return result.count !== 0;
  } catch (error) {
    throw createDataAccessError("Failed to delete shortUrl", { cause: error });
  }
}

export async function getAllShortUrlsByUserId(userId, isDeleted = false) {
  try {
    const shortUrlsByUser = await prisma.shortUrl.findMany({
      where: { userId: userId, is_deleted: isDeleted },
    });

    return shortUrlsByUser;
  } catch (error) {
    throw createDataAccessError("Failed to get shortUrls", { cause: error });
  }
}
