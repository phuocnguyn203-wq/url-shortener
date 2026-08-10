import { expect } from "vitest";

const expectedDatabaseUrl = "file:./test.db";

if (process.env.NODE_ENV !== "test") {
  throw new Error("Tests must run with NODE_ENV=test");
}

if (process.env.DATABASE_URL !== expectedDatabaseUrl) {
  throw new Error(
    `Refusing to run test against: ${process.env.DATABASE_URL}`
  );
}