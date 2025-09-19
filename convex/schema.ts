import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  students: defineTable({
    name: v.string(),
    phone: v.string(),
    accessCode: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_phone", ["phone"])
    .index("by_access_code", ["accessCode"]),

  files: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    fileId: v.id("_storage"),
    fileType: v.union(v.literal("video"), v.literal("image"), v.literal("document")),
    mimeType: v.string(),
    size: v.number(),
    uploadedBy: v.string(), // teacher identifier
    uploadedAt: v.number(),
    isPublic: v.boolean(),
    tags: v.optional(v.array(v.string())),
  }).index("by_type", ["fileType"])
    .index("by_upload_date", ["uploadedAt"]),

  downloads: defineTable({
    studentId: v.id("students"),
    fileId: v.id("files"),
    downloadedAt: v.number(),
  }).index("by_student", ["studentId"])
    .index("by_file", ["fileId"]),

  aiChats: defineTable({
    studentId: v.id("students"),
    message: v.string(),
    response: v.string(),
    timestamp: v.number(),
  }).index("by_student", ["studentId"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
