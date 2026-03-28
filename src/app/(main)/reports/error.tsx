'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center p-8 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-red-600" />
      </div>
      
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-2xl font-black text-gray-900">오류가 발생했습니다</h2>
        <p className="text-gray-500 max-w-md font-medium">
          데이터를 불러오거나 페이지를 렌더링하는 중 문제가 발생했습니다. 
          {error.message && <span className="block mt-2 text-xs font-mono bg-red-50 p-2 rounded text-red-700">{error.message}</span>}
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="bg-purple-800 text-white font-bold rounded-xl h-11 px-6 hover:bg-purple-900 shadow-lg shadow-purple-200 flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" /> 다시 시도
        </Button>
        <Link href="/">
          <Button variant="outline" className="h-11 px-6 rounded-xl font-bold border-gray-200 bg-white flex items-center gap-2">
            <Home className="w-4 h-4" /> 홈으로 이동
          </Button>
        </Link>
      </div>
    </div>
  );
}
