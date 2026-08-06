import {
	it,
	expect,
	describe,
	beforeEach,
	afterAll,
	beforeEach
} from "vitest";

import {
	fetchUserById,
	fetchUserByUsername,
	insertUserToDb
} from "../../src/app/repositories/users.repository.js";

import { prisma } from "../../src/config/db.js";

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

		expect(result).toEqual(user);
	})

	it("returns null when given non-exist id", async () => {
		const nonExistId = 99999;
		const result = await fetchUserById(nonExistId);

		expect(result).toBeNull();
	})
});

describe("fetchUserByUsername", () => {
	it("returns user when given username that exists", async () => {
		const user = await createTestUser();

		const result = await fetchUserByUsername(user.username);

		expect(result).toEqual(user);
	})

	it("returns null when given username that doesn't exist", async () => {
		const result = await fetchUserByUsername("It doesn't exist");

		expect(result).toBeNull();
	})
})