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

import AppError from "../../src/app/errors/AppError.js";

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
    // Arrange
    const user = await createTestUser();

    // Act
    const result = await createShortUrl(
      "http://example.com",
      user.id,
    );


    // Assert
    expect(result.id).toEqual(expect.any(Number));
    expect(result.originalUrl).toBe(
      "http://example.com",
    );
    
    // Assert side effect
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

  it("wraps database errors in AppError", async () => {
    // Arrange
    const nonExistUserId = 99999;

    // Act, Assert
    await expect(
      createShortUrl(
        "http://example.com",
        nonExistUserId,
      )
    ).rejects.toBeInstanceOf(AppError);
  })
})

describe("findShortUrlById", async () => {
  it("returns active URL by its ID", async () => {
    // Arrange
    const user = await createTestUser();
    const shortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl: "http://example.com",
        userId: user.id,
      }
    })

    // Act
    const result = await findShortUrlById(
      shortUrl.id
    )

    // Assert
    expect(result).not.toBeNull();
    expect(result.id).toBe(shortUrl.id);
    expect(result.originalUrl).toBe("http://example.com");
    expect(result.is_deleted).toBe(false);
  })

  it("returns null for non exist shortUrl", async () => {
    // Arrange
    const nonExistShortUrlId = 99999;

    // Act, Assert
    await expect(findShortUrlById(nonExistShortUrlId))
      .resolves
      .toBeNull();
  })

  it("returns null for deleted shortUrl", async () => {
    // Arrange
    const user = await createTestUser();

    const deletedShortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl: "http://example.com",
        userId: user.id,
        is_deleted: true,
      }
    })

    //Act, Assert
    await expect(findShortUrlById(deletedShortUrl.id))
      .resolves
      .toBeNull();
  })
})

describe("softDeleteShortUrlById", async () => {
  it("soft-deletes when given urlId and userId", async () => {
    // Arrance
    const user = await createTestUser();
    const shortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl: "http://example.com",
        userId: user.id,
      }
    })

    // Act, Assert
    await expect(softDeleteShortUrlById(shortUrl.id, user.id))
      .resolves  
      .toBe(true);

    // Assert side effect
    const url = await prisma.shortUrl.findUnique({
      where: {
        id: shortUrl.id
      }
    });
    expect(url.is_deleted).toBe(true);
  });

  it("returns false when it's deleted already", async () => {
    // Arrange
    const user = await createTestUser();
    const deletedShortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl: "http://example.com",
        userId: user.id,
        is_deleted: true,
      }
    });

    // Act, Assert
    await expect(softDeleteShortUrlById(deletedShortUrl.id, user.id))
      .resolves
      .toBe(false);
  })
})
