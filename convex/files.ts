import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const uploadFile = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    fileId: v.id("_storage"),
    fileType: v.union(v.literal("video"), v.literal("image"), v.literal("document")),
    mimeType: v.string(),
    size: v.number(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("files", {
      title: args.title,
      description: args.description,
      fileId: args.fileId,
      fileType: args.fileType,
      mimeType: args.mimeType,
      size: args.size,
      uploadedBy: "teacher",
      uploadedAt: Date.now(),
      isPublic: true,
      tags: args.tags,
    });

    return fileId;
  },
});

export const getAllFiles = query({
  handler: async (ctx) => {
    const files = await ctx.db.query("files").order("desc").collect();
    
    return await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.fileId),
      }))
    );
  },
});

export const getFilesByType = query({
  args: {
    fileType: v.union(v.literal("video"), v.literal("image"), v.literal("document")),
  },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_type", (q) => q.eq("fileType", args.fileType))
      .order("desc")
      .collect();

    return await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.fileId),
      }))
    );
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("الملف غير موجود");
    }

    await ctx.storage.delete(file.fileId);
    await ctx.db.delete(args.fileId);
    
    return true;
  },
});

export const recordDownload = mutation({
  args: {
    studentId: v.id("students"),
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("downloads", {
      studentId: args.studentId,
      fileId: args.fileId,
      downloadedAt: Date.now(),
    });
  },
});

export const getDownloadStats = query({
  handler: async (ctx) => {
    const downloads = await ctx.db.query("downloads").collect();
    const files = await ctx.db.query("files").collect();
    
    const stats = files.map(file => {
      const fileDownloads = downloads.filter(d => d.fileId === file._id);
      return {
        fileId: file._id,
        title: file.title,
        downloadCount: fileDownloads.length,
      };
    });

    return stats.sort((a, b) => b.downloadCount - a.downloadCount);
  },
});
