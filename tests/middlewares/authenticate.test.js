import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  vi
} from 'vitest';

import * as usersService from '../../src/app/services/users.service.js';
import { authenticate } from '../../src/app/middlewares/authenticate.middleware';
import jwt, { verify } from "jsonwebtoken";
import { prisma } from '../../src/config/db';

describe("authenticate", async () => {
  let req;
  let res;
  let next;

  beforeEach(async () => {
    req = {
      cookies: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();
    
    await prisma.shortUrl.deleteMany();
    await prisma.user.deleteMany();

    vi.clearAllMocks();
  })

  afterEach(() => {
    vi.restoreAllMocks();
  })

  it("returns 401 when token is missing", () => {
    // Arrange

    // Act
    authenticate(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing Token",
    })

    expect(next).not.toHaveBeenCalled();
  })

  it("sets req.userId and calls next when token is valid", async () => {
    // Arrange
    const username =  "johndoe";
    const hashedPassword = "fake-hashed-password";
    const user = await prisma.user.create({
      data: {
        username, hashedPassword
      }
    })
    req.cookies.token = usersService.getJwtToken(
      user,
      process.env.JWT_SECRET,
      "15m",
    )

    // Act
    authenticate(req, res, next);

    // Assert

    expect(req.userId).toBe(user.id);
    expect(next).toHaveBeenCalledOnce();
  })

  it("returns 401 when token is expired", () => {
    // Arrange
    req.cookies.token = 'expired-token';

    const verifySpy = vi
      .spyOn(usersService, "verifyJwtToken")
      .mockImplementation(() => {
        throw new jwt.TokenExpiredError();
      });
    
    // Act
    authenticate(req, res, next);
    
    // Assert
    expect(verifySpy).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "401" });

    expect(next).not.toHaveBeenCalled();
  })

  it("returns 401 when token is invalid", () => {
    // Arrange
    req.cookies.token = 'invalid-token';

    // Act
    authenticate(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error : "401" });
    expect(next).not.toHaveBeenCalled();
  })

  it("passes unknown errors to next", () => {
    // Arrange
    req.cookies.token = 'random-token';
    const error = new Error("Unknown error");

    const verifySpy = vi
      .spyOn(usersService, "verifyJwtToken")
      .mockImplementation(() => {
        throw error;
      });
    
    // Act
    authenticate(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  })
})