import {
  createUser,
  getJwtToken,
  getUserByUsername,
  getUserById,
  verifyPassword,
} from "../services/users.service.js";
import { Errors, createAppError } from "../errors/errorDefinitions.js";

function toUserDto(user) {
  const {hashedPassword, ...userDto} = user;
  return userDto;
}

export const signUp = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password)
    throw createAppError(Errors.INVALID_CREDENTIAL_INPUT);

  if (typeof username !== "string" || typeof password !== "string")
    throw createAppError(Errors.INVALID_CREDENTIAL_INPUT)
  
  const user = await createUser(username, password);
  const formattedUser = toUserDto(user);
  return res.status(201).json(formattedUser);
};

export const signIn = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password)
    throw createAppError(Errors.INVALID_CREDENTIAL_INPUT);
  
  if (typeof username !== "string" || typeof password !== "string")
    throw createAppError(Errors.INVALID_CREDENTIAL_INPUT);

  if (username.trim() === "")
    throw createAppError(Errors.INVALID_CREDENTIAL_INPUT);

  if (password.trim() === "")
    throw createAppError(Errors.INVALID_CREDENTIAL_INPUT);

  const user = await getUserByUsername(req.body.username);
  
  if (! await verifyPassword(req.body.password, user.hashedPassword))
    throw createAppError(Errors.INVALID_CREDENTIALS);

  const jwtToken = getJwtToken(user, process.env.JWT_SECRET, "15m");

  res.cookie("token", jwtToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 15,
  });

  return res.json({ message: "logged in" });
};

export const getCurrentUser = async (req, res) => {
  const userId = req.userId;
  const user = await getUserById(userId);
  const formattedUser = toUserDto(user);
  return res.json(formattedUser);
};
