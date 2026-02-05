-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'error',
    "userId" TEXT,
    "salonId" TEXT,
    "url" TEXT,
    "method" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT,
    "salonId" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInteraction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "salonId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "requiresReply" BOOLEAN NOT NULL DEFAULT false,
    "lastReplyAt" TIMESTAMP(3),
    "replied" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureUsageLog" (
    "id" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "duration" INTEGER,
    "itemCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceMetric" (
    "id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "endpoint" TEXT,
    "userId" TEXT,
    "salonId" TEXT,
    "isSlowQuery" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ErrorLog_userId_idx" ON "ErrorLog"("userId");

-- CreateIndex
CREATE INDEX "ErrorLog_salonId_idx" ON "ErrorLog"("salonId");

-- CreateIndex
CREATE INDEX "ErrorLog_severity_idx" ON "ErrorLog"("severity");

-- CreateIndex
CREATE INDEX "ErrorLog_resolved_idx" ON "ErrorLog"("resolved");

-- CreateIndex
CREATE INDEX "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_salonId_idx" ON "ActivityLog"("salonId");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_resource_idx" ON "ActivityLog"("resource");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "UserInteraction_userId_idx" ON "UserInteraction"("userId");

-- CreateIndex
CREATE INDEX "UserInteraction_salonId_idx" ON "UserInteraction"("salonId");

-- CreateIndex
CREATE INDEX "UserInteraction_type_idx" ON "UserInteraction"("type");

-- CreateIndex
CREATE INDEX "UserInteraction_status_idx" ON "UserInteraction"("status");

-- CreateIndex
CREATE INDEX "UserInteraction_requiresReply_idx" ON "UserInteraction"("requiresReply");

-- CreateIndex
CREATE INDEX "UserInteraction_createdAt_idx" ON "UserInteraction"("createdAt");

-- CreateIndex
CREATE INDEX "FeatureUsageLog_userId_idx" ON "FeatureUsageLog"("userId");

-- CreateIndex
CREATE INDEX "FeatureUsageLog_salonId_idx" ON "FeatureUsageLog"("salonId");

-- CreateIndex
CREATE INDEX "FeatureUsageLog_featureName_idx" ON "FeatureUsageLog"("featureName");

-- CreateIndex
CREATE INDEX "FeatureUsageLog_createdAt_idx" ON "FeatureUsageLog"("createdAt");

-- CreateIndex
CREATE INDEX "PerformanceMetric_metric_idx" ON "PerformanceMetric"("metric");

-- CreateIndex
CREATE INDEX "PerformanceMetric_isSlowQuery_idx" ON "PerformanceMetric"("isSlowQuery");

-- CreateIndex
CREATE INDEX "PerformanceMetric_createdAt_idx" ON "PerformanceMetric"("createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_salonId_idx" ON "SupportTicket"("salonId");

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
