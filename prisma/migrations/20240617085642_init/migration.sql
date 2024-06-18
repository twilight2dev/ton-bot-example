/*
  Warnings:

  - You are about to alter the column `balance` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telegramId" INTEGER NOT NULL,
    "tonAddress" TEXT,
    "privateKey" TEXT,
    "publicKey" TEXT,
    "balance" DECIMAL NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("balance", "id", "privateKey", "publicKey", "telegramId", "tonAddress") SELECT "balance", "id", "privateKey", "publicKey", "telegramId", "tonAddress" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
