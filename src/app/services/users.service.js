import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  insertUserToDb,
  fetchUserById,
  fetchUserByUsername,
} from "../repositories/users.repository.js";

import { Errors, createAppError } from "../errors/errorDefinitions.js";

export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function createUser(username, plainPassword) {
  const hashedPassword = await bcrypt.hash(plainPassword, 12);
  return await insertUserToDb(username, hashedPassword);
}

export async function getUserById(userId) {
  const user = await fetchUserById(userId);
  if (!user)
    throw createAppError(Errors.USER_NOT_FOUND);
  return user;
}

export async function getUserByUsername(username) {
  const user = await fetchUserByUsername(username);
  if (!user)
    throw createAppError(Errors.INVALID_CREDENTIALS);
  return user;
}

export function getJwtToken(user, jwtSecret, expireMin) {
  return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: expireMin });
}

export function verifyJwtToken(token, secret) {
  return jwt.verify(token, secret);
}
