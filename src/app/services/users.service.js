import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { insertUserToDb, fetchUserById, fetchUserByUsername } from '../repositories/users.repository.js';

export async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function createUser(username, plainPassword) {

    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    return await insertUserToDb(username, hashedPassword);
}

export async function getUserById(userId) {

    return await fetchUserById(userId);
}

export async function getUserByUsername(username) {

    return await fetchUserByUsername(username);
}

export function getJwtToken(user, jwtSecret, expireMin) {
    return jwt.sign(
        { sub: user.id },
        jwtSecret,
        { expiresIn: expireMin }
    )
}

export function verifyJwtToken(token, secret) {
    return jwt.verify(token, secret);
}