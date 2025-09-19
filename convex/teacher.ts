import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const TEACHER_CODE = "9090";

export const teacherLogin = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.code !== TEACHER_CODE) {
      throw new Error("كود المعلم غير صحيح");
    }
    return { success: true, role: "teacher" };
  },
});

export const getDashboardStats = query({
  handler: async (ctx) => {
    const students = await ctx.db.query("students").collect();
    const files = await ctx.db.query("files").collect();
    const downloads = await ctx.db.query("downloads").collect();
    const chats = await ctx.db.query("aiChats").collect();

    const activeStudents = students.filter(s => s.isActive).length;
    const totalFiles = files.length;
    const totalDownloads = downloads.length;
    const totalChats = chats.length;

    const filesByType = {
      videos: files.filter(f => f.fileType === "video").length,
      images: files.filter(f => f.fileType === "image").length,
      documents: files.filter(f => f.fileType === "document").length,
    };

    return {
      totalStudents: students.length,
      activeStudents,
      totalFiles,
      totalDownloads,
      totalChats,
      filesByType,
    };
  },
});
