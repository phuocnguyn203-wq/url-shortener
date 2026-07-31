import { prisma } from "../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.ts";
import DataAccessError from "../errors/DataAccessError.js";

export async function saveUrl(originalUrl, userId) {
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

export async function readUrl(urlId) {
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

export async function updateDelete(urlId) {
  try {
    const updateUser = await prisma.shortUrl.update({
      where: { id: urlId },
      data: { is_deleted: true },
    })

    return updateUser;
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }
}