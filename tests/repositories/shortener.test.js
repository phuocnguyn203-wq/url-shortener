import {
    afterAll,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";

import { prisma } from "../../src/config/db.js";

import {
    createShortUrl,
    findShortUrlById,
    softDeleteShortUrlById,
    getAllShortUrlsByUserId,   
} from "../../src/app/repositories/shortener.repository.js";

import DataAccessError from "../../src/app/errors/DataAccessError.js";

beforeEach(async() => {
    await prisma.shortUrl.deleteMany();
    await prisma.user.deleteMany();
})

afterAll(async() => {
    await prisma.$disconnect();
})

async function createTestUser(username="alice") {
    return await prisma.user.create({
        data: {
            username: username,
            hashedPassword: "fake-hashed-password",
        }
    })
}

describe("createShortUrl", () => {
  it("creates a URL belong to a given user", async () => {
    const user = await createTestUser();

    const result = await createShortUrl(
      "http://example.com",
      user.id,
    );

    expect(result.id).toEqual(expect.any(Number));
    expect(result.originalUrl).toBe(
      "http://example.com",
    );
    
    const recordInDatabase = 
      await prisma.shortUrl.findUnique({
        where: {
          id: result.id,
        }
      });
    
    expect(recordInDatabase).not.toBeNull();
    expect(recordInDatabase.originalUrl).toBe(
      "http://example.com",
    )
    expect(recordInDatabase.userId).toBe(user.id);
  })

  it("wraps database errors in DataAccessError", async () => {
    const nonExistUserId = 99999;

    await expect(
      createShortUrl(
        "http://example.com",
        nonExistUserId,
      )
    ).rejects.toBeInstanceOf(DataAccessError);
  })
})

describe("findShortUrlById", async () => {
  it("returns active URL by its ID", async () => {
    const user = await createTestUser();

    const shortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl: "http://example.com",
        userId: user.id,
      }
    })

    const result = await findShortUrlById(
      shortUrl.id
    )

    expect(result).not.toBeNull();
    expect(result.id).toBe(shortUrl.id);
    expect(result.originalUrl).toBe("http://example.com");
    expect(result.is_deleted).toBe(false);
  })

  it("returns null for non exist shortUrl", async () => {
    const nonExistShortUrlId = 99999;

    const result = await findShortUrlById(nonExistShortUrlId);

    expect(result).toBe(null);
  })

  it("returns null for deleted shortUrl", async () => {
    const user = await createTestUser();

    const deletedShortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl: "http://example.com",
        userId: user.id,
        is_deleted: true,
      }
    })

    const result = await findShortUrlById(deletedShortUrl.id);

    expect(result).toBeNull();
  })
})

describe("softDeleteShortUrlById", async () => {
  it("soft-deletes when given urlId and userId", async () => {
    const user = await createTestUser();

    const shortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl: "http://example.com",
        userId: user.id,
      }
    })

    const result = await softDeleteShortUrlById(
      shortUrl.id,
      user.id,
    )

    expect(result).toBe(true);

    const url = await prisma.shortUrl.findUnique({
      where: {
        id: shortUrl.id,
        is_deleted: false
      }
    });

    expect(url).toBeNull();
  })

  it("returns false when userId doesn't match", async () => {
    
    const user = await createTestUser();
    const otherUser = await createTestUser("john");

    const shortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl: "http://example.com",
        userId: user.id,
      }
    })

    const result = await softDeleteShortUrlById(
      shortUrl.id,
      otherUser.id,
    )

    expect(result).toBe(false);
  })

  it("returns false when it's deleted already", async () => {
    const user = await createTestUser();

    const deletedShortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl: "http://example.com",
        userId: user.id,
        is_deleted: true,
      }
    }) 

    const result = await softDeleteShortUrlById(
      deletedShortUrl.id,
      user.id,
    )

    expect(result).toBe(false);
  })
})
