'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Share2, Printer, MoreHorizontal } from "lucide-react";

export default function NoticeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [notice, setNotice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotice();
  }, [params.id]);

  const fetchNotice = async () => {
    try {
      const response = await fetch(`/api/boards/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotice(data);
      } else {
        router.push('/notices');
      }
    } catch (error) {
      console.error('Error fetching notice:', error);
      router.push('/notices');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 w-full animate-pulse">
        <div className="h-8 bg-gray-100 rounded-full w-48" />
        <div className="h-20 bg-gray-100 rounded-3xl" />
        <div className="h-[500px] bg-gray-50 rounded-[3rem]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 w-full">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="text-gray-500 font-bold hover:text-gray-900 group"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 w-5 h-5 transition-transform group-hover:-translate-x-1" /> 뒤로 가기
        </Button>
        <div className="flex gap-2">
           <Button variant="outline" size="icon" className="rounded-xl border-gray-200"><Share2 className="w-4 h-4 text-gray-500" /></Button>
           <Button variant="outline" size="icon" className="rounded-xl border-gray-200"><Printer className="w-4 h-4 text-gray-500" /></Button>
           <Button variant="outline" size="icon" className="rounded-xl border-gray-200"><MoreHorizontal className="w-4 h-4 text-gray-500" /></Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Badge className="bg-purple-100 text-purple-700 border-none px-4 py-1.5 font-black text-sm rounded-full">공지사항</Badge>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tighter">
            {notice.title}
          </h1>
          <div className="flex items-center gap-6 text-gray-400 font-bold py-2">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                   <User className="w-4 h-4 text-purple-700" />
                </div>
                <span>관리자</span>
             </div>
             <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
             </div>
          </div>
        </div>

        <Card className="border-none shadow-2xl shadow-gray-100 rounded-[3rem] overflow-hidden bg-white">
          <CardContent className="p-12 md:p-16">
            <div className="prose prose-purple max-w-none">
               <p className="text-xl leading-relaxed text-gray-700 font-medium whitespace-pre-wrap">
                 {notice.content}
               </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-8">
        <Button 
          variant="outline" 
          className="border-2 border-gray-200 rounded-2xl h-14 px-10 font-black text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
          onClick={() => router.push('/notices')}
        >
          전체 목록으로
        </Button>
      </div>
    </div>
  );
}
