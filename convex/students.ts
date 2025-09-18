import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// دالة لتوليد كود عشوائي من 6 أرقام
function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// إضافة طالب جديد (للمدرس فقط)
export const addStudent = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    // التحقق من عدم وجود الطالب مسبقاً
    const existingStudent = await ctx.db
      .query("students")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (existingStudent) {
      throw new Error("هذا الرقم مسجل مسبقاً");
    }

    // توليد كود وصول فريد
    let accessCode: string;
    let codeExists = true;
    
    while (codeExists) {
      accessCode = generateAccessCode();
      const existing = await ctx.db
        .query("students")
        .withIndex("by_access_code", (q) => q.eq("accessCode", accessCode))
        .first();
      codeExists = !!existing;
    }

    const studentId = await ctx.db.insert("students", {
      name: args.name,
      phone: args.phone,
      accessCode: accessCode!,
      isActive: true,
      createdAt: Date.now(),
    });

    return { studentId, accessCode: accessCode! };
  },
});

// تسجيل دخول الطالب بالكود
export const loginWithCode = mutation({
  args: {
    accessCode: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_access_code", (q) => q.eq("accessCode", args.accessCode))
      .first();

    if (!student || !student.isActive) {
      throw new Error("كود الوصول غير صحيح أو غير مفعل");
    }

    // إنشاء جلسة جديدة
    await ctx.db.insert("studentSessions", {
      studentId: student._id,
      accessCode: args.accessCode,
      loginAt: Date.now(),
      isActive: true,
    });

    return student;
  },
});

// الحصول على قائمة الطلاب (للمدرس فقط)
export const getStudents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const students = await ctx.db
      .query("students")
      .order("desc")
      .collect();

    return students;
  },
});

// تفعيل/إلغاء تفعيل طالب
export const toggleStudentStatus = mutation({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

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

// التحقق من صحة كود الوصول
export const verifyAccessCode = query({
  args: {
    accessCode: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_access_code", (q) => q.eq("accessCode", args.accessCode))
      .first();

    return student && student.isActive ? student : null;
  },
});
