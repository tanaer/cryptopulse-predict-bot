-- Create PriceAlert table
CREATE TABLE "PriceAlert" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "marketId" TEXT NOT NULL,
    "outcomeIndex" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "targetPrice" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceAlert_pkey" PRIMARY KEY ("id")
);

-- Create CopyTradeSignal table
CREATE TABLE "CopyTradeSignal" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "outcomeIndex" INTEGER NOT NULL,
    "side" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "executedCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" TIMESTAMP(3),

    CONSTRAINT "CopyTradeSignal_pkey" PRIMARY KEY ("id")
);

-- Create CopyTradeConfig table
CREATE TABLE "CopyTradeConfig" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "ratio" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "maxAmount" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CopyTradeConfig_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "PriceAlert_telegramId_isActive_idx" ON "PriceAlert"("telegramId", "isActive");
CREATE INDEX "PriceAlert_marketId_isActive_idx" ON "PriceAlert"("marketId", "isActive");
CREATE INDEX "CopyTradeSignal_isActive_createdAt_idx" ON "CopyTradeSignal"("isActive", "createdAt");
CREATE INDEX "CopyTradeConfig_isActive_idx" ON "CopyTradeConfig"("isActive");

-- Create unique constraint
CREATE UNIQUE INDEX "CopyTradeConfig_telegramId_key" ON "CopyTradeConfig"("telegramId");

-- Add foreign keys
ALTER TABLE "PriceAlert" ADD CONSTRAINT "PriceAlert_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CopyTradeConfig" ADD CONSTRAINT "CopyTradeConfig_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;
