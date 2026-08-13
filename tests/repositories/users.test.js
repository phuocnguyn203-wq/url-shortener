import {
	it,
	expect,
	describe,
	beforeEach,
	afterAll,
} from "vitest";

import {
	fetchUserById,
	fetchUserByUsername,
	insertUserToDb
} from "../../src/app/repositories/users.repository.js";

import { prisma } from "../../src/config/db.js";
import AppError from "../../src/app/errors/AppError.js";

beforeEach(async () => {
	await prisma.shortUrl.deleteMany();
	await prisma.user.deleteMany();
})

afterAll(async () => {
	await prisma.$disconnect();
})

async function createTestUser(username="alice") {
	return await prisma.user.create({
		data: {
			username: username,
			hashedPassword: 'fake-hashed-password'
		}
	})
}



describe("fetchUserById", async () => {
	it("returns a user when given an id of a user", async () => {
		// Arrange
		const user = await createTestUser();
		
		// Act
		const result = await fetchUserById(user.id);
		
		// Assert
		expect(result.username).toBe(user.username);
	})

	it("returns null when given non-exist id", async () => {
		// Arrange
		const nonExistId = 99999;

		// Act, Assert
		await expect(fetchUserById(nonExistId))
			.resolves
			.toBeNull();
	})
});

describe("fetchUserByUsername", () => {
	it("returns user when given username that exists", async () => {
		// Arrange
		const user = await createTestUser();

		// Act
		const result = await fetchUserByUsername(user.username);

		// Assert
		expect(result).toEqual(user);
	})

	it("returns null when given username that doesn't exist", async () => {
		// Arrange, Act, Assert
		await expect(fetchUserByUsername("It doesn't exist"))
			.resolves
			.toBeNull();
	})
})

describe("insertUserToDb", async () => {
	it("inserts user when given username and hashedPassword", async () => {
		// Arrange
		const username = "johndoe";
		const hashedPassword = "fake-hashed-password";

		// Act
		const user = await insertUserToDb(
			username,
			hashedPassword,
		)

		// Assert
		expect(user.username).toBe("johndoe");
		expect(user.hashedPassword).toBe("fake-hashed-password");

		// Assert side effect
		const justInsertedUser = await prisma.user.findUnique({
			where: {id: user.id,}
		});

		expect(justInsertedUser).toEqual(user);
	})

	it("doesn't insert when given existed username", async () => {
		// Arrange
		const username = "johndoe";
		const hashedPassword = "fake-hashed-password";
		const user = await createTestUser(username);

		// Act, Assert
		await expect(insertUserToDb(username, hashedPassword))
			.rejects
			.toBeInstanceOf(AppError);
		
		// Assert side effect
		const allUsers = await prisma.user.findMany({
			where: {username}
		});
		expect(allUsers.length).toBe(1);
	})
})