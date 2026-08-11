import request from "supertest";
import {
  beforeEach, 
  describe,
  expect,
  it
} from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/config/db.js";
import { getJwtToken } from "../../src/app/services/users.service.js";
import { encodeBase62 } from "../../src/app/services/shortener.service.js";
//create a new user before each test
async function createNewUser() {
  const user = await prisma.user.create({
    data: {
      username: "johndoe",
      hashedPassword: "fake-hashed-password",
    }
  });

  const token = await getJwtToken(
    user,
    process.env.JWT_SECRET,
    "15m",
  )
  
  return { user, token };
}

beforeEach(async () => {
  await prisma.shortUrl.deleteMany();
  await prisma.user.deleteMany();
});

describe("POST /shortened", () => {
  it("creates a shortened URL for an authenticated user", async () => {
    // Arrange
    const { user, token } = await createNewUser();

    // Act
    const response = await request(app)
      .post("/shortened")
      .set("Cookie", `token=${token}`)
      .send({
        originalUrl: "https://example.com",
      });

    //Assert response
    expect(response.status).toBe(200);
    expect(response.body.shortUrl).toEqual(
      expect.any(String),
    );

    // Assert side effect
    const newShortUrl = await prisma.shortUrl.findFirst({
      where: {userId: user.id},
    })

    expect(newShortUrl).not.toBeNull();
    expect(newShortUrl.originalUrl).toBe("https://example.com");
  });

  it("returns 400 when given invalid URL", async () => {
    // Arrange
    const { user, token } = await createNewUser();
    
    // Act
    const response = await request(app)
      .post("/shortened")
      .set("Cookie", `token=${token}`)
      .send({
        originalUrl: "Not valid URL",
      });
    
    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid URL");

    // Assert side effects
    const notExistShortUrl = await prisma.shortUrl.findFirst({
      where: {
        userId: user.id,
      }
    });

    expect(notExistShortUrl).toBeNull();
  });

  it("Returns 400 when not given URL", async () => {
    // Arrange
    const { user, token } = await createNewUser();

    // Act
    const response = await request(app)
      .post("/shortened")
      .set("Cookie", `token=${token}`)
      .send({});
    
    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error.trim()).toBe("URL is required");
    // Assert side effect
    const notExistShortUrl = await prisma.shortUrl.findFirst({
      where: {
        userId: user.id
      }
    });

    expect(notExistShortUrl).toBeNull();
  })
});

describe("GET /shortened", () => {
  it("returns all shortened URLs for an authenticated user", async () => {
    // Arrange
    const { user, token } = await createNewUser();

    await prisma.shortUrl.createMany({
      data: [
        { originalUrl: "https://amazon.com", userId: user.id},
        { originalUrl: "https://netflix.com", userId: user.id},
        { originalUrl: "https://microsoft.com", userId: user.id },
        { originalUrl: "https://palantir.com", userId: user.id }, 
      ]
    })
    
    // Act
    const response = await request(app)
      .get("/shortened/")
      .set("Cookie", `token=${token}`);
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(4);
    expect(response.body[0].originalUrl).toBe("https://amazon.com");
  });
});

describe("DELETE /shortened", () => {
  it("deletes when given id of shortUrl of owner", async () => {
    // Arrange
    const { user, token } = await createNewUser();
    const shortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl: "https://example.com",
        userId: user.id,
      }
    });
    const code = encodeBase62(shortUrl.id);

    // Act
    const response = await request(app)
      .delete(`/shortened/${code}`)
      .set("Cookie", `token=${token}`);
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toBe(true);

    // Assert side effect
    const deletedShortUrl = prisma.shortUrl.findUnique({
      where: {
        id: shortUrl.id,
        deleted: true,
      }
    });
    expect(deletedShortUrl).not.toBeNull();
  })
});

describe("GET shortened/deleted", () => {
  it("returns shortUrl deleted", async () => {
    // Arrange
    const { user, token } = await createNewUser();
    const deletedUrls = [
      { originalUrl: "https://example.com", is_deleted: true, userId: user.id },
      { originalUrl: "https://amazon.com", is_deleted: false, userId: user.id },
      { originalUrl: "https://beginnerdev.com", is_deleted: true, userId: user.id },
    ]
    const deletedShortUrl = await prisma.shortUrl.createMany({
      data: deletedUrls
    });

    //Act
    const response = await request(app)
      .get("/shortened/deleted")
      .set("Cookie", `token=${token}`);
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[1].originalUrl).toEqual(deletedUrls[2].originalUrl);
  })
});

describe("GET shortened/:code", async () => {
  it("redirects to originalUrl", async () => {
    // Arrange
    const { user } = await createNewUser();
    const shortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl: "https://netflix.com",
        userId: user.id,
      }
    });
    
    const code = encodeBase62(shortUrl.id);

    // Act
    const response = await request(app)
      .get(`/shortened/${code}`);
    
    // Assert
    expect(response.status).toBe(302);
    expect(response.header?.location).toBe(shortUrl.originalUrl);
  })
})