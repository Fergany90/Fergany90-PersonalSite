import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // جدول الطلاب
  students: defineTable({
    name: v.string(),
    phone: v.string(),
    accessCode: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_access_code", ["accessCode"])
    .index("by_phone", ["phone"]),

  // جدول الملفات المرفوعة
  files: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    fileId: v.id("_storage"),
    fileType: v.string(), // video, image, document
    fileName: v.string(),
    fileSize: v.number(),
    uploadedBy: v.id("users"), // المدرس الذي رفع الملف
    uploadedAt: v.number(),
    isPublic: v.boolean(),
  })
    .index("by_uploaded_by", ["uploadedBy"])
    .index("by_type", ["fileType"])
    .index("by_upload_date", ["uploadedAt"]),

  // جدول تسجيل دخول الطلاب
  studentSessions: defineTable({
    studentId: v.id("students"),
    accessCode: v.string(),
    loginAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_student", ["studentId"])
    .index("by_access_code", ["accessCode"]),

  // جدول تحميل الملفات (لتتبع من حمل ماذا)
  downloads: defineTable({
    fileId: v.id("files"),
    studentId: v.id("students"),
    downloadedAt: v.number(),
  })
    .index("by_file", ["fileId"])
    .index("by_student", ["studentId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
