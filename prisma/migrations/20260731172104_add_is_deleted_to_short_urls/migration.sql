-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_short_urls" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalUrl" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "short_urls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_short_urls" ("id", "originalUrl", "updatedAt", "userId") SELECT "id", "originalUrl", "updatedAt", "userId" FROM "short_urls";
DROP TABLE "short_urls";
ALTER TABLE "new_short_urls" RENAME TO "short_urls";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
