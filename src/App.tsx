import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentPortal from "./components/StudentPortal";

export default function App() {
  const [studentAccessCode, setStudentAccessCode] = useState<string>("");
  const [showStudentPortal, setShowStudentPortal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">📚</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            منصة التعلم الذكية
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {!showStudentPortal && (
            <button
              onClick={() => setShowStudentPortal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              دخول الطلاب
            </button>
          )}
          {showStudentPortal && (
            <button
              onClick={() => setShowStudentPortal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              لوحة المدرس
            </button>
          )}
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 p-6">
        {showStudentPortal ? (
          <StudentPortal 
            accessCode={studentAccessCode}
            setAccessCode={setStudentAccessCode}
          />
        ) : (
          <Content />
        )}
      </main>
      <Toaster position="top-center" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Authenticated>
        <TeacherDashboard />
      </Authenticated>

      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">👨‍🏫</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              مرحباً بك في منصة التعلم
            </h1>
            <p className="text-gray-600">
              سجل دخولك كمدرس لإدارة الملفات والطلاب
            </p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
