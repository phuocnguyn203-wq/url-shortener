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

import {
	DataAccessError
} from "../../src/app/errors/DataAccessError.js";

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
		const user = await createTestUser();

		const result = await fetchUserById(user.id);
		expect(result.username).toBe(user.username);
	})

	it("returns null when given non-exist id", async () => {
		const nonExistId = 99999;
		try {
			const result = await fetchUserById(nonExistId);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
		}
	})
});

describe("fetchUserByUsername", () => {
	it("returns user when given username that exists", async () => {
		const user = await createTestUser();

		const result = await fetchUserByUsername(user.username);

		expect(result).toEqual(user);
	})

	it("returns null when given username that doesn't exist", async () => {
		try {
			const result = await fetchUserByUsername("It doesn't exist");
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
		}
		
	})
})

describe("insertUserToDb", async () => {
	it("inserts user when given username and hashedPassword", async () => {
		const user = await insertUserToDb(
			"johndoe",
			"fake-hashed-password",
		)

		expect(user.username).toBe("johndoe");
		expect(user.hashedPassword).toBe("fake-hashed-password");

		const justInsertedUser = await prisma.user.findUnique({
			where: {id: user.id,}
		});

		expect(justInsertedUser).toEqual(user);
	})

	it("doesn't insert and returns null when given existed username", async () => {
		const user = await createTestUser("johndoe");
		try {
			const user = await insertUserToDb(
				"johndoe",
				"fake-hashed-password"
			);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			expect(err.message).toBe("Username already exists");
		}
		
	})
})