import {
  describe,
  expect,
  it,
  beforeEach,
  afterAll,
  vi
} from 'vitest';

import { verifyJwtToken } from '../../src/app/services/users.service';
import { authenticate } from '../../src/app/middlewares/authenticate.middleware';
import jwt, { verify } from "jsonwebtoken";

vi.mock("../../src/app/services/users.service", () => ({
  verifyJwtToken: vi.fn(),
}));

describe("authenticate", async () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      cookies: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();

    vi.clearAllMocks();
  })

  it("returns 401 when token is missing", () => {
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing Token",
    })

    expect(verifyJwtToken).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  })

  it("sets req.userId and calls next when token is valid", () => {
    req.cookies.token = 'valid-token';
    vi.mocked(verifyJwtToken).mockReturnValue({
      sub: '10',
    });

    authenticate(req, res, next);

    expect(verifyJwtToken).toHaveBeenCalledWith(
      "valid-token",
      process.env.JWT_SECRET,
    )

    expect(req.userId).toBe(10);
    expect(next).toHaveBeenCalledOnce();

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  })

  it("returns 401 when token is expired", () => {
    req.cookies.token = 'expired-token';

    vi.mocked(verifyJwtToken).mockImplementation(() => {
      throw new jwt.TokenExpiredError();
    })

    authenticate(req, res, next);

    expect(verifyJwtToken).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled({ error: "401" });

    expect(next).not.toHaveBeenCalled();
  })

  it("returns 401 when token is invalid", () => {
    req.cookies.token = 'invalid-token';

    vi.mocked(verifyJwtToken).mockImplementation(() => {
      throw new jwt.JsonWebTokenError();
    });

    authenticate(req, res, next);

    expect(verifyJwtToken).toHaveBeenCalledWith(
      "invalid-token",
      process.env.JWT_SECRET,
    )

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error : "401" });
    expect(next).not.toHaveBeenCalled();
  })

  it("passes unknown errors to next", () => {
    req.cookies.token = 'random-token';

    const error = new Error("unknown error");

    vi.mocked(verifyJwtToken).mockImplementation(() => {
      throw error;
    })

    authenticate(req, res, next);

    expect(verifyJwtToken).toHaveBeenCalledWith(
      'random-token',
      process.env.JWT_SECRET,
    )

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  })
})