import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// رفع ملف جديد (للمدرس فقط)
export const uploadFile = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    fileId: v.id("_storage"),
    fileType: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const fileId = await ctx.db.insert("files", {
      title: args.title,
      description: args.description,
      fileId: args.fileId,
      fileType: args.fileType,
      fileName: args.fileName,
      fileSize: args.fileSize,
      uploadedBy: userId,
      uploadedAt: Date.now(),
      isPublic: true,
    });

    return fileId;
  },
});

// الحصول على رابط رفع الملف
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// الحصول على قائمة الملفات للطلاب
export const getFilesForStudents = query({
  args: {
    accessCode: v.string(),
  },
  handler: async (ctx, args) => {
    // التحقق من صحة كود الوصول
    const student = await ctx.db
      .query("students")
      .withIndex("by_access_code", (q) => q.eq("accessCode", args.accessCode))
      .first();

    if (!student || !student.isActive) {
      throw new Error("كود الوصول غير صحيح");
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_upload_date")
      .order("desc")
      .collect();

    // إضافة رابط التحميل لكل ملف
    const filesWithUrls = await Promise.all(
      files.map(async (file) => ({
        ...file,
        downloadUrl: await ctx.storage.getUrl(file.fileId),
      }))
    );

    return filesWithUrls;
  },
});

// الحصول على قائمة الملفات للمدرس
export const getFilesForTeacher = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_uploaded_by", (q) => q.eq("uploadedBy", userId))
      .order("desc")
      .collect();

    // إضافة رابط التحميل لكل ملف
    const filesWithUrls = await Promise.all(
      files.map(async (file) => ({
        ...file,
        downloadUrl: await ctx.storage.getUrl(file.fileId),
      }))
    );

    return filesWithUrls;
  },
});

// تسجيل تحميل ملف
export const recordDownload = mutation({
  args: {
    fileId: v.id("files"),
    accessCode: v.string(),
  },
  handler: async (ctx, args) => {
    // التحقق من صحة كود الوصول
    const student = await ctx.db
      .query("students")
      .withIndex("by_access_code", (q) => q.eq("accessCode", args.accessCode))
      .first();

    if (!student || !student.isActive) {
      throw new Error("كود الوصول غير صحيح");
    }

    await ctx.db.insert("downloads", {
      fileId: args.fileId,
      studentId: student._id,
      downloadedAt: Date.now(),
    });

    return true;
  },
});

// حذف ملف (للمدرس فقط)
export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("الملف غير موجود");
    }

    if (file.uploadedBy !== userId) {
      throw new Error("ليس لديك صلاحية لحذف هذا الملف");
    }

    await ctx.db.delete(args.fileId);
    return true;
  },
});

// إحصائيات التحميل للمدرس
export const getDownloadStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_uploaded_by", (q) => q.eq("uploadedBy", userId))
      .collect();

    const stats = await Promise.all(
      files.map(async (file) => {
        const downloads = await ctx.db
          .query("downloads")
          .withIndex("by_file", (q) => q.eq("fileId", file._id))
          .collect();

        return {
          fileName: file.fileName,
          title: file.title,
          downloadCount: downloads.length,
          uploadedAt: file.uploadedAt,
        };
      })
    );

    return stats;
  },
});
