-- CreateTable
CREATE TABLE "PendingHomeShare" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "ShareRole" NOT NULL DEFAULT 'READ',
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingHomeShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingHomeShare_token_key" ON "PendingHomeShare"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PendingHomeShare_homeId_email_key" ON "PendingHomeShare"("homeId", "email");

-- AddForeignKey
ALTER TABLE "PendingHomeShare" ADD CONSTRAINT "PendingHomeShare_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;
