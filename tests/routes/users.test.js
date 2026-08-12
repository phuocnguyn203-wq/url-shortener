import {
  describe,
  it,
  beforeEach,
  expect,
} from "vitest";

import { prisma } from "../../src/config/db.js";
import app from "../../src/app.js";
import request from "supertest";

beforeEach(async () => {
  await prisma.shortUrl.deleteMany();
  await prisma.user.deleteMany();
})

describe("POST /users/create", () => {
  it("creates and stores user in db", async () => {
    // Arrange
    const username = "johndoe";
    const password = 'fake-password';

    // Act
    const response = await request(app)
      .post("/users/create")
      .send({
        username,
        password
      });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).not.toHaveProperty("hashedPassword");
    
    // Assert side effect
    const user = await prisma.user.findUnique({
      where: {
        username
      }
    });
    expect(user).not.toBeNull();
  });

  it("returns 400 for duplicated username ib db", async () => {
    // Arrange
    const user = await prisma.user.create({
      data: {
        username: "johndoe",
        hashedPassword: "fake-hashed-password",
      }
    });

    const duplicatedUsername = "johndoe";
    const password = "fake-password"; 
    
    // Act
    const response = await request(app)
      .post("/users/create")
      .send({
        username: duplicatedUsername,
        password: password,
      });
    
    expect(response.status).toBe(400);
    
    // Assert side effect
    const nonExistUser = await prisma.user.findMany({
      where: {
        username: duplicatedUsername,
      }
    });

    expect(nonExistUser.length).toBe(1);
  });
});

describe("POST /users/login", () => {
  it("returns 200 for successful login", async () => {
    // Arrange
    const username = "johndoe";
    const password = "123";
    await request(app)
      .post("/users/create")
      .send({
        username,
        password
      });

    // Act
    const response = await request(app)
      .post("/users/login")
      .send({
        username,
        password,
      });
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.header['set-cookie'][0]).toContain("token=");
  });

  it("returns 401 when given wrong password", async () => {
    // Arrange
    const username = "johndoe";
    const password = "123";
    const wrongPassword = 'wrongPassword';

    await request(app)
      .post("/users/create")
      .send({
        username, password
      });

    // Act
    const response = await request(app)
      .post("/users/login")
      .send({
        username: username,
        password: wrongPassword,
      })

    // Assert
    expect(response.status).toBe(401);
  })
})

describe("GET /users/me", () => {
  it("returns current logged in users object", async () => {
    // Arrange
    const username = "johndoe";
    const password = "123";
    await request(app)
      .post("/users/create")
      .send({
        username, password
      });
    
    const loginResponse = await request(app)
      .post("/users/login")
      .send({
        username, password
      });
    const cookie = loginResponse
      .headers["set-cookie"][0]
      .split(';')[0]

    // Act
    const response = await request(app)
      .get("/users/me")
      .set("Cookie", cookie);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.username).toBe(username);
  })
})