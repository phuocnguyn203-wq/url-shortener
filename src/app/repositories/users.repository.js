import { prisma } from "../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.js";
import DataAccessError from "../errors/DataAccessError.js";

export async function insertUserToDb(username, hashedPassword) {
  try {
    return await prisma.user.create({
      data: {
        username: username,
        hashedPassword: hashedPassword,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError, error.code === "P2002"){
      return new DataAccessError("Username already exists", { cause: error });
    }
    throw new DataAccessError(error.message, { cause: error });
  }
}

export async function fetchUserById(userId) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }
}

export async function fetchUserByUsername(username) {
  try {
    return await prisma.user.findUnique({
      where: { username: username },
    });
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }
}
