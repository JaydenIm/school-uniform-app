'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Megaphone, Plus, Search, Calendar, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function NoticesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
 Aurora:

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/boards');
      if (response.ok) {
        const data = await response.json();
        setNotices(data);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 w-full">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-purple-600 font-bold mb-1">
             <Megaphone className="w-5 h-5" />
             <span className="uppercase tracking-wider text-sm">Announcement</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">파트너 공지사항</h1>
          <p className="text-gray-500 font-medium text-lg">온핏 파트너 분들을 위한 중요 공지 및 시스템 업데이트 소식입니다.</p>
        </div>
        {session?.user?.role === 'ADMIN' && (
          <Button 
            className="bg-purple-800 text-white rounded-2xl h-14 px-8 font-bold hover:bg-purple-900 shadow-xl shadow-purple-200 transition-all hover:scale-105"
            onClick={() => router.push('/notices/write')}
          >
            <Plus className="mr-2 w-5 h-5" /> 새 공지 작성
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input 
          className="pl-12 h-14 bg-white border-gray-100 rounded-2xl shadow-sm focus:ring-purple-500 text-lg font-medium" 
          placeholder="검색어를 입력하세요 (제목, 내용)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <Card 
              key={notice.id} 
              className="border-none shadow-lg shadow-gray-100 hover:shadow-xl hover:shadow-purple-100 transition-all duration-300 cursor-pointer group rounded-3xl overflow-hidden"
              onClick={() => router.push(`/notices/${notice.id}`)}
            >
              <CardContent className="p-8 flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-3 py-1 font-bold text-xs rounded-full">중요</Badge>
                    <span className="text-sm font-bold text-gray-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                    {notice.title}
                  </h3>
                  <p className="text-gray-500 line-clamp-1 font-medium italic">
                    {notice.content.replace(/<[^>]*>?/gm, '')}
                  </p>
                </div>
                <div className="flex items-center text-gray-300 group-hover:text-purple-500 transition-colors ml-8">
                  <ChevronRight className="w-8 h-8 stroke-[3]" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <p className="text-gray-400 font-bold text-xl">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
