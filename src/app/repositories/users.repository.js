import { prisma } from "../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.js";
import DataAccessError from "../errors/DataAccessError.js";
import AppError  from "../errors/AppError.js";

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
      throw new AppError(
        "Username already exists",
        409,
        "USERNAME_ALREADY_EXISTS",
      );
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
    });

  } catch (error) {
    throw new DataAccessError(
      "Failed to fetch user", 
      { cause: error }
    );
  }

  if (!user) throw new AppError(
    "User not found",
    404,
    "USER_NOT_FOUND"
  );
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

  if (!user) throw new AppError(
    "User not found",
    401, 
    "USER_NOT_FOUND"
  );
  return user;
}
