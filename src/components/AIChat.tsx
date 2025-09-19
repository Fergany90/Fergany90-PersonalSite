import React, { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

import { Id } from "../../convex/_generated/dataModel";

interface AIChatProps {
  studentId: Id<"students">;
}

export default function AIChat({ studentId }: AIChatProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatHistory = useQuery(api.students.getChatHistory, { studentId }) || [];
  const chatWithAI = useAction(api.ai.chatWithAI);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
      await chatWithAI({ message: userMessage, studentId });
    } catch (error: any) {
      toast.error("حدث خطأ في إرسال الرسالة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg h-[600px] flex flex-col">
      <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
        <h3 className="text-xl font-bold flex items-center">
          <span className="mr-2">🤖</span>
          المساعد الذكي - مدعوم بـ Gemini AI
        </h3>
        <p className="text-sm opacity-90 mt-1">اسأل أي سؤال تعليمي وسأساعدك!</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p>ابدأ محادثة مع المساعد الذكي!</p>
            <p className="text-sm mt-2">يمكنك سؤال أي سؤال تعليمي أو طلب المساعدة</p>
          </div>
        )}

        {chatHistory.map((chat) => (
          <div key={chat._id} className="space-y-4">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-xs lg:max-w-md">
                <p className="text-sm">{chat.message}</p>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs lg:max-w-md">
                <div className="flex items-center mb-2">
                  <span className="text-sm">🤖 المساعد الذكي</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{chat.response}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">المساعد يكتب...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "⏳" : "📤"}
          </button>
        </div>
      </form>
    </div>
  );
}
