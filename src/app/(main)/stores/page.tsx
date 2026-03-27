'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Store as StoreIcon, MapPin, Phone, Building, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Store {
  id: number;
  name: string;
  roadAddress: string;
  detailAddress: string;
  phoneNumber: string;
  createdAt: string;
}

export default function StoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // 신규 매장 폼 상태
  const [newStore, setNewStore] = useState({
    name: '',
    roadAddress: '',
    detailAddress: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchStores();
    }
  }, [status, router]);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores');
      if (!response.ok) throw new Error('매장 정보를 불러오는데 실패했습니다.');
      const data = await response.json();
      setStores(data.stores || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('매장 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStore = async () => {
    if (!newStore.name || !newStore.roadAddress) {
      toast.error('매장명과 주소를 입력해 주세요.');
      return;
    }

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '매장 등록에 실패했습니다.');
      }

      toast.success('매장이 등록되었습니다.');
      setIsDialogOpen(false);
      setNewStore({ name: '', roadAddress: '', detailAddress: '', phoneNumber: '' });
      fetchStores();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const columns: ColumnDef<Store>[] = [
    {
      accessorKey: "name",
      header: "매장명",
      cell: ({ row }) => (
        <div className="font-bold text-gray-900">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "roadAddress",
      header: "주소",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {row.getValue("roadAddress")} {row.original.detailAddress}
        </div>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "연락처",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 font-medium">{row.getValue("phoneNumber") || '-'}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "등록일",
      cell: ({ row }) => (
        <div className="text-xs text-gray-400">
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#4B0082' }} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1">
          <li>시스템 설정</li>
          <li className="flex items-center">
            <ChevronRight className="w-3 h-3 mx-1" />
            <span className="text-gray-900 font-semibold">매장 관리</span>
          </li>
        </ol>
      </nav>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">매장 관리</h1>
          <p className="text-gray-500 mt-1">등록된 매장 정보를 관리하고 새로운 매장을 추가합니다.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-800 text-white font-bold rounded-xl h-11 px-5 hover:bg-purple-900 shadow-lg shadow-purple-200">
              <PlusCircle className="mr-2 w-4 h-4" /> 매장 신규 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white rounded-3xl p-8 border-none shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                <StoreIcon className="w-6 h-6 text-purple-700" /> 매장 정보 입력
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">매장명</Label>
                <div className="relative">
                  <Input 
                    placeholder="매장 이름을 입력하세요"
                    value={newStore.name}
                    onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
                    className="h-11 pl-10 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-purple-500"
                  />
                  <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">도로명 주소</Label>
                <div className="relative">
                  <Input 
                    placeholder="도로명 주소를 입력하세요"
                    value={newStore.roadAddress}
                    onChange={(e) => setNewStore(prev => ({ ...prev, roadAddress: e.target.value }))}
                    className="h-11 pl-10 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-purple-500"
                  />
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">상세 주소</Label>
                <Input 
                  placeholder="상세 주소를 입력하세요"
                  value={newStore.detailAddress}
                  onChange={(e) => setNewStore(prev => ({ ...prev, detailAddress: e.target.value }))}
                  className="h-11 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-purple-500"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">연락처</Label>
                <div className="relative">
                  <Input 
                    placeholder="예: 02-1234-5678"
                    value={newStore.phoneNumber}
                    onChange={(e) => setNewStore(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="h-11 pl-10 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-purple-500"
                  />
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-8">
              <Button 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)}
                className="h-12 rounded-xl"
              >
                취소
              </Button>
              <Button 
                onClick={handleAddStore}
                className="bg-purple-800 text-white rounded-xl h-12 px-8 font-bold hover:bg-purple-900 transition-all ml-2"
              >
                등록 완료
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-lg font-black text-gray-900">매장 목록</h2>
          <p className="text-sm text-gray-400 mt-0.5">현재 등록되어 사용 중인 매장 정보입니다.</p>
        </div>
        <div className="p-6">
          <DataTable 
            columns={columns} 
            data={stores} 
            placeholder="등록된 매장이 없습니다."
          />
        </div>
      </div>
    </div>
  );
}
