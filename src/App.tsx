import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import StudentLogin from "./components/StudentLogin";
import TeacherLogin from "./components/TeacherLogin";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import Footer from "./components/Footer";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userType, setUserType] = useState<"student" | "teacher" | null>(null);
  const [showTeacherLogin, setShowTeacherLogin] = useState(false);

  const handleStudentLogin = (student: any) => {
    setCurrentUser(student);
    setUserType("student");
  };

  const handleTeacherLogin = () => {
    setCurrentUser({ role: "teacher" });
    setUserType("teacher");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    setShowTeacherLogin(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">📚</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  منصة التعلم الذكية
                </h1>
                <p className="text-sm text-gray-600">بواسطة الأستاذ عمر الفرجاني</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  تسجيل الخروج
                </button>
              )}
              
              {!currentUser && !showTeacherLogin && (
                <button
                  onClick={() => setShowTeacherLogin(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  دخول المعلم
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
        {!currentUser && !showTeacherLogin && (
          <StudentLogin onLogin={handleStudentLogin} />
        )}
        
        {!currentUser && showTeacherLogin && (
          <TeacherLogin 
            onLogin={handleTeacherLogin} 
            onBack={() => setShowTeacherLogin(false)}
          />
        )}
        
        {currentUser && userType === "student" && (
          <StudentDashboard student={currentUser} />
        )}
        
        {currentUser && userType === "teacher" && (
          <TeacherDashboard />
        )}
      </main>

      <Footer />
      <Toaster position="top-center" />
    </div>
  );
}
