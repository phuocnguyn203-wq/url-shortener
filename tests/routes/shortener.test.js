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
async function createNewUser(username="johndoe") {
  const user = await prisma.user.create({
    data: {
      username: username,
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
    expect(response.body.error).toBe("INVALID_URL");

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
    expect(response.body.error.trim()).toBe("URL_REQUIRED");
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

    const shortUrls =  [
      { originalUrl: "https://amazon.com", userId: user.id},
      { originalUrl: "https://netflix.com", userId: user.id},
      { originalUrl: "https://microsoft.com", userId: user.id },
      { originalUrl: "https://palantir.com", userId: user.id }, 
    ];
    await prisma.shortUrl.createMany({
      data: shortUrls 
    })
    
    // Act
    const response = await request(app)
      .get("/shortened/")
      .set("Cookie", `token=${token}`);
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(4);
    const expectArray = shortUrls.map((shortUrl) => {
      return expect.objectContaining({ 
        originalUrl: shortUrl.originalUrl,
        userId: shortUrl.userId,
      });
    });
    expect(response.body).toEqual(
      expect.arrayContaining(expectArray)
    )
  });
});

describe("DELETE /shortened", async () => {
  it("deletes when given code of shortUrl of owner", async () => {
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
    const deletedShortUrl = await prisma.shortUrl.findUnique({
      where: {
        id: shortUrl.id,
        is_deleted: true,
      }
    });
    expect(deletedShortUrl).not.toBeNull();
  });

  it("returns 404 when user A tries to delete url of user B", async () => {
    // Arrange
    const { user: userA, token: tokenA } = await createNewUser("UserA");
    const { user: userB, token: tokenB } = await createNewUser("UserB");
    const shortUrl = await prisma.shortUrl.create({
      data: { originalUrl: "https://netflix.com", userId: userB.id }
    })
    const code = encodeBase62(shortUrl.id);
    
    // Act
    const response = await request(app)
      .delete(`/shortened/${code}`)
      .set("Cookie", `token=${tokenA}`);
    
    // Assert
    expect(response.status).toBe(404);

    // Assert side effect
    const userBShortUrl = await prisma.shortUrl.findUnique({
      where: { id: shortUrl.id },
    });
    expect(userBShortUrl.is_deleted).toBe(false);

  })
});

describe("GET shortened/deleted", () => {
  it("returns shortUrl deleted", async () => {
    // Arrange
    const { user, token } = await createNewUser();
    const data = [
      { originalUrl: "https://example.com", is_deleted: true, userId: user.id },
      { originalUrl: "https://amazon.com", is_deleted: false, userId: user.id },
      { originalUrl: "https://beginnerdev.com", is_deleted: true, userId: user.id },
    ];
    const shortUrls = await prisma.shortUrl.createMany({
      data: data
    });

    //Act
    const response = await request(app)
      .get("/shortened/deleted")
      .set("Cookie", `token=${token}`);
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          originalUrl: "https://example.com",
        }),
        expect.objectContaining({
          originalUrl: "https://beginnerdev.com",
        }),
      ]),
    );
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