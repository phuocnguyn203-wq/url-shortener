import {
  createUser,
  getJwtToken,
  getUserByUsername,
  getUserById,
  verifyPassword,
} from "../services/users.service.js";
import DataAccessError from "../errors/DataAccessError.js";

function toUserDto(user) {
  return {
    username: user.username,
  };
}

export const signUp = async (req, res) => {
  const user = await createUser(req.body.username, req.body.password);
  const formattedUser = toUserDto(user);
  return res.status(201).json(formattedUser);
};

export const signIn = async (req, res) => {
  const user = await getUserByUsername(req.body.username);
  if (!user || ! await verifyPassword(req.body.password, user.hashedPassword)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

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
