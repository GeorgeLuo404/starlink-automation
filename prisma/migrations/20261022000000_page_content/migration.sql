-- Editable page copy, one row per page section (see PageContent in schema.prisma).
CREATE TABLE "PageContent" (
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("key")
);
