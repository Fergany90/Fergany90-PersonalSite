import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface StudentLoginProps {
  onLogin: (student: any) => void;
}

export default function StudentLogin({ onLogin }: StudentLoginProps) {
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const loginStudent = useMutation(api.students.loginStudent);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.length !== 6) {
      toast.error("كود الدخول يجب أن يكون 6 أرقام");
      return;
    }

    setIsLoading(true);
    try {
      const student = await loginStudent({ accessCode });
      toast.success(`مرحباً ${student.name}!`);
      onLogin(student);
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
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🎓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">دخول الطلاب</h2>
          <p className="text-gray-600">أدخل كود الدخول المكون من 6 أرقام</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كود الدخول
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || accessCode.length !== 6}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            💡 إذا لم يكن لديك كود دخول، تواصل مع الأستاذ عمر الفرجاني
          </p>
        </div>
      </div>
    </div>
  );
}
