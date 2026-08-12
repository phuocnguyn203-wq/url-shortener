import { prisma } from "../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.ts";
import DataAccessError from "../errors/DataAccessError.js";
import { Errors, createAppError } from "../errors/errorDefinitions.js";
export async function insertUserToDb(username, hashedPassword) {
  try {
    return await prisma.user.create({
      data: {
        username: username,
        hashedPassword: hashedPassword,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError 
      && error.code === "P2002") {
      throw createAppError(Errors.INVALID_CREDENTIAL_INPUT);
    } 
    throw new DataAccessError(
      "Failed to create user", 
      { cause: error }
    );
  }
}

export async function fetchUserById(userId) {
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: { shortUrls: true },
    });

  } catch (error) {
    throw new DataAccessError(
      "Failed to fetch user", 
      { cause: error }
    );
  }

  return user;
}

export async function fetchUserByUsername(username) {
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { username: username },
    });

  } catch (error) {
    throw new DataAccessError(
      "Failed to fetch user", 
      { cause: error }
    );
  }

  return user;
}
