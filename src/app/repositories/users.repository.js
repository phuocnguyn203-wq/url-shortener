import { prisma } from "../../config/db.js";
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
