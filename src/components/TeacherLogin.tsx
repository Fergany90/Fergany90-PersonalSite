import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface TeacherLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export default function TeacherLogin({ onLogin, onBack }: TeacherLoginProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const teacherLogin = useMutation(api.teacher.teacherLogin);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      await teacherLogin({ code });
      toast.success("مرحباً أستاذ عمر!");
      onLogin();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">👨‍🏫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">دخول المعلم</h2>
          <p className="text-gray-600">أدخل كود المعلم للوصول للوحة التحكم</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كود المعلم
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
              placeholder="****"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 px-4 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            >
              رجوع
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "جاري التحقق..." : "دخول"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
