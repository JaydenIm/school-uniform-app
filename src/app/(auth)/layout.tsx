import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* 왼쪽: 검은색 배경 섹션 */}
      <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center">
        <div className="max-w-md text-white text-center">
          <h1 className="text-4xl font-bold mb-6">School Uniform</h1>
          <p className="text-lg text-gray-400">
            교복 관리 시스템에 오신 것을 환영합니다
          </p>
        </div>
      </div>

      {/* 오른쪽: 폼 영역 */}
      <div className="flex-1 flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
} 