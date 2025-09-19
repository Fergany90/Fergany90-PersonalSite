"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const GEMINI_API_KEY = "AIzaSyAOg-GwRizftAonNqOEg37HMMqH4oNT9EM";

export const chatWithAI = action({
  args: {
    message: v.string(),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `أنت مساعد تعليمي ذكي للطلاب. أجب على السؤال التالي بطريقة مفيدة وتعليمية: ${args.message}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من فهم سؤالك.";

      // Save chat to database
      await ctx.runMutation(internal.students.saveChatInternal, {
        studentId: args.studentId,
        message: args.message,
        response: aiResponse,
      });

      return aiResponse;
    } catch (error) {
      console.error("AI Chat Error:", error);
      return "عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي.";
    }
  },
});




