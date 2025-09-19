import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Generate 6-digit access code
function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const createStudent = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if student already exists
    const existingStudent = await ctx.db
      .query("students")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (existingStudent) {
      throw new Error("طالب مسجل بهذا الرقم من قبل");
    }

    const accessCode = generateAccessCode();
    
    const studentId = await ctx.db.insert("students", {
      name: args.name,
      phone: args.phone,
      accessCode,
      isActive: true,
      createdAt: Date.now(),
    });

    return { studentId, accessCode };
  },
});

export const loginStudent = mutation({
  args: {
    accessCode: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_access_code", (q) => q.eq("accessCode", args.accessCode))
      .first();

    if (!student || !student.isActive) {
      throw new Error("كود الدخول غير صحيح أو الحساب غير مفعل");
    }

    return student;
  },
});

export const getAllStudents = query({
  handler: async (ctx) => {
    return await ctx.db.query("students").order("desc").collect();
  },
});

export const toggleStudentStatus = mutation({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("الطالب غير موجود");
    }

    await ctx.db.patch(args.studentId, {
      isActive: !student.isActive,
    });

    return !student.isActive;
  },
});

export const regenerateAccessCode = mutation({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const newAccessCode = generateAccessCode();
    
    await ctx.db.patch(args.studentId, {
      accessCode: newAccessCode,
    });

    return newAccessCode;
  },
});

export const getChatHistory = query({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiChats")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .take(50);
  },
});

export const saveChatInternal = internalMutation({
  args: {
    studentId: v.id("students"),
    message: v.string(),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiChats", {
      studentId: args.studentId,
      message: args.message,
      response: args.response,
      timestamp: Date.now(),
    });
  },
});
