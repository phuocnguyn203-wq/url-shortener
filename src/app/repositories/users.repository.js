import { prisma } from "../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.ts";
import DataAccessError from "../errors/DataAccessError.js";
import { use } from "react";

export async function insertUserToDb(username, hashedPassword) {
  try {
    return await prisma.User.create({
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
    return await prisma.User.findUnique({
      where: { id: userId },
    });
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }
}

export async function fetchUserByUsername(username) {
  try {
    return await prisma.User.findUnique({
      where: { username: username },
    });
  } catch (error) {
    throw new DataAccessError(error.message, { cause: error });
  }
}
