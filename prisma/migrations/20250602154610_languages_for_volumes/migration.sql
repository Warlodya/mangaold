-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Volume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "mangaId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'UA',
    CONSTRAINT "Volume_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Volume" ("id", "mangaId", "number") SELECT "id", "mangaId", "number" FROM "Volume";
DROP TABLE "Volume";
ALTER TABLE "new_Volume" RENAME TO "Volume";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
