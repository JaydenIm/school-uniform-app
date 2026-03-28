'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export default function NoticeWritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      if (response.ok) {
        toast.success("공지사항이 등록되었습니다.");
        router.push('/notices');
        router.refresh();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 w-full">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="text-gray-500 font-bold hover:text-gray-900 group"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 w-5 h-5 transition-transform group-hover:-translate-x-1" /> 목록으로 돌아가기
        </Button>
        <h1 className="text-2xl font-black text-gray-900">새 공지사항 작성</h1>
      </div>

      <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2rem] overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Title</label>
              <Input 
                className="h-14 bg-gray-50 border-none rounded-2xl text-xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="공지 제목을 입력하세요"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Content</label>
              <div className="relative group">
                <Textarea 
                  className="min-h-[400px] bg-gray-50 border-none rounded-3xl text-lg font-medium p-6 placeholder:text-gray-300 focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                  placeholder="파트너 분들께 전달할 자세한 내용을 작성해주세요..."
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-50 group-focus-within:opacity-100 transition-opacity">
                   <Button type="button" variant="ghost" size="icon" className="bg-white rounded-xl shadow-sm"><ImageIcon className="w-5 h-5 text-gray-400" /></Button>
                   <Button type="button" variant="ghost" size="icon" className="bg-white rounded-xl shadow-sm"><LinkIcon className="w-5 h-5 text-gray-400" /></Button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-purple-800 text-white rounded-2xl h-16 text-xl font-black hover:bg-purple-900 shadow-xl shadow-purple-200 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "등록 중..." : "공지사항 등록하기"} <Send className="ml-3 w-6 h-6" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
