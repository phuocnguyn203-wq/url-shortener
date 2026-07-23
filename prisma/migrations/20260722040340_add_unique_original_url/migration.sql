/*
  Warnings:

  - A unique constraint covering the columns `[originalUrl]` on the table `shortenedUrls` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "shortenedUrls_originalUrl_key" ON "shortenedUrls"("originalUrl");
