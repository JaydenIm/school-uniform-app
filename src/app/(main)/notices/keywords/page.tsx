'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Plus, Trash2, Hash, ArrowLeft, Info, Gavel, ExternalLink, RefreshCcw } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface Keyword {
  id: number;
  keyword: string;
  createdAt: string;
}

interface BidInfo {
    id: string;
    bidNtceNm: string;
    ntceInstNm: string;
    bidMethodNm: string;
    bidEndDate: string;
    status: string;
    url: string;
}

export default function SearchKeywordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchKeywords();
    }
  }, [status, router]);

  const fetchKeywords = async () => {
    try {
      const response = await fetch('/api/nara/keywords');
      if (response.ok) {
        const data = await response.json();
        setKeywords(data || []);
      }
    } catch (error) {
      toast.error('키워드 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;
    setIsAdding(true);
    try {
      const response = await fetch('/api/nara/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword.trim() }),
      });
      const result = await response.json();
      if (response.ok) {
        setKeywords([result, ...keywords]);
        setNewKeyword('');
        toast.success('검색 키워드가 등록되었습니다.');
      } else {
        toast.error(result.error || '등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다.');
    } finally {
      setIsAdding(false);
    }
  };

  const deleteKeyword = async (id: number) => {
    try {
      const response = await fetch(`/api/nara/keywords/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setKeywords(keywords.filter(k => k.id !== id));
        toast.success('키워드가 삭제되었습니다.');
      } else {
        toast.error('삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
             <Gavel className="w-8 h-8 text-purple-700" />
             조달청 검색 키워드 관리
          </h1>
          <p className="text-gray-500 mt-2 font-medium">나라장터(G2B)에서 교복 입찰 공고를 검색할 때 사용할 키워드를 설정하세요.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-gray-200 hover:bg-gray-50 font-bold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> 뒤로가기
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 설명 영역 */}
        <div className="md:col-span-1 space-y-6">
            <Card className="border-none shadow-xl bg-purple-50/50 rounded-[2rem] overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg font-black text-purple-900 flex items-center gap-2">
                        <Info className="w-5 h-5" /> 검색 키워드란?
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-purple-800/80 font-medium leading-relaxed">
                    <p>등록된 키워드는 대시보드에서 나라장터 공고를 자동으로 필터링하는 데 사용됩니다.</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>교복, 학생복 등의 직접적인 단어</li>
                        <li>관심 지역(예: 서울 교복, 경기도 교육청)</li>
                        <li>다양한 관련 키워드를 등록할수록 탐색 확률이 높아집니다.</li>
                    </ul>
                </CardContent>
            </Card>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 font-bold">
                    <RefreshCcw className="w-4 h-4 animate-spin-slow" />
                    <span className="text-sm">자동 업데이트</span>
                </div>
                <p className="text-xs text-amber-600 font-medium leading-relaxed">
                    시스템이 등록된 키워드를 사용하여 주기적으로 새로운 공고를 확인하고 대시보드에 표시합니다.
                </p>
            </div>
        </div>

        {/* 관리 영역 */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-6 px-8">
                <CardTitle className="text-xl font-black text-gray-900">키워드 목록 및 추가</CardTitle>
                <CardDescription className="font-medium text-gray-500">원하는 검색어를 입력하고 엔터를 누르거나 등록 버튼을 클릭하세요.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input 
                    placeholder="새로운 검색 키워드 입력 (예: 경기도 교복)" 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                    className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50/50 text-lg font-bold focus:ring-purple-500 shadow-inner"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <Button 
                    onClick={addKeyword}
                    disabled={isAdding || !newKeyword.trim()}
                    className="bg-purple-800 text-white rounded-2xl h-14 px-8 font-black text-lg hover:bg-purple-900 shadow-xl shadow-purple-200 transition-all flex items-center gap-2"
                >
                  {isAdding ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Plus className="w-6 h-6" />}
                  등록
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">저장된 키워드 ({keywords.length})</h3>
                </div>

                {isLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800" />
                  </div>
                ) : keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {keywords.map((k) => (
                      <div 
                        key={k.id}
                        className="group flex items-center gap-2 bg-purple-100 border-2 border-purple-200 pl-4 pr-2 py-2.5 rounded-2xl shadow-sm hover:shadow-lg hover:border-purple-500 hover:bg-purple-600 transition-all duration-300 animate-in zoom-in-95"
                      >
                        <Hash className="w-4 h-4 text-purple-700 group-hover:text-white group-hover:rotate-12 transition-all" />
                        <span className="font-black text-purple-900 group-hover:text-white transition-colors">{k.keyword}</span>
                        <button 
                          onClick={() => deleteKeyword(k.id)}
                          className="ml-2 p-1.5 text-purple-400 group-hover:text-white hover:bg-white/20 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <Search className="w-12 h-12 text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold text-lg">등록된 키워드가 없습니다.</p>
                    <p className="text-gray-300 text-sm mt-1 font-medium">공고 필터링을 위해 키워드를 등록해 보세요.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
