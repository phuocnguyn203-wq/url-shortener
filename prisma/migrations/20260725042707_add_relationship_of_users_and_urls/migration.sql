/*
  Warnings:

  - You are about to drop the `shortenedUrls` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "shortenedUrls";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "short_urls" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalUrl" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "short_urls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
