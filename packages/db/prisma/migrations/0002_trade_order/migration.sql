CREATE TABLE "TradeOrder" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "marketId" TEXT NOT NULL,
    "outcomeIndex" INTEGER NOT NULL,
    "side" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "orderId" TEXT,
    "avgPrice" DOUBLE PRECISION,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeOrder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TradeOrder_telegramId_createdAt_idx" ON "TradeOrder"("telegramId", "createdAt");

CREATE INDEX "TradeOrder_marketId_outcomeIndex_idx" ON "TradeOrder"("marketId", "outcomeIndex");

ALTER TABLE "TradeOrder" ADD CONSTRAINT "TradeOrder_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;

