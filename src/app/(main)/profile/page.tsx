'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserCircle, Camera, Lock, Save, LogOut, Phone, Mail, User } from "lucide-react";
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: '',
    phoneNumber: '',
    image: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (res.ok) {
          setProfileData({
            name: data.name || '',
            phoneNumber: data.phoneNumber || '',
            image: data.image || '',
          });
          setPreviewImage(data.image || null);
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      }
    };
    fetchProfile();
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("이미지 크기는 1MB 이하여야 합니다.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        setProfileData(prev => ({ ...prev, image: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '프로필 수정 실패');

      await updateSession({
        name: profileData.name,
      });

      toast.success('프로필이 업데이트되었습니다.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (passwordData.newPassword.length < 4) {
      toast.error('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '비밀번호 변경 실패');

      toast.success('비밀번호가 성공적으로 변경되었습니다.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">내 정보 관리</h1>
          <p className="text-gray-500 mt-1">프로필 정보를 확인하고 보안 설정을 관리하세요.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 h-11 px-5 rounded-xl font-bold transition-all"
        >
          <LogOut className="w-4 h-4 mr-2" /> 로그아웃
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* 왼쪽: 프로필 사진 */}
        <Card className="col-span-1 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-purple-800 to-indigo-900 text-white pb-12">
            <CardTitle className="text-lg font-bold">프로필 사진</CardTitle>
          </CardHeader>
          <CardContent className="-mt-10 flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-20 h-20 text-gray-300" />
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-purple-700 transition-all border-2 border-white"
              >
                <Camera className="w-5 h-5" />
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <div className="mt-4 text-center">
              <h3 className="font-bold text-gray-900">{profileData.name}</h3>
              <p className="text-xs text-gray-400 font-medium mt-1">{session?.user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* 오른쪽: 정보 수정 및 비밀번호 */}
        <div className="col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-white rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" /> 기본 정보
              </CardTitle>
              <CardDescription>계정의 기본 인적 사항을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-400">이름</Label>
                  <Input 
                    value={profileData.name} 
                    onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-400">이메일 (변경 불가)</Label>
                  <Input value={session?.user?.email || ''} readOnly className="h-11 rounded-xl bg-gray-50 text-gray-400 border-gray-100" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">전화번호</Label>
                <div className="relative">
                  <Input 
                    value={profileData.phoneNumber} 
                    onChange={e => setProfileData(p => ({ ...p, phoneNumber: e.target.value }))}
                    className="h-11 pl-10 rounded-xl"
                    placeholder="예: 010-1234-5678"
                  />
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isLoading}
                  className="w-full bg-purple-800 text-white font-bold h-12 rounded-xl hover:bg-purple-900 shadow-lg shadow-purple-100"
                >
                  <Save className="w-4 h-4 mr-2" /> 정보 저장하기
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" /> 비밀번호 변경
              </CardTitle>
              <CardDescription>보안을 위해 비밀번호를 주기적으로 변경해 주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">현재 비밀번호</Label>
                <Input 
                  type="password"
                  value={passwordData.currentPassword} 
                  onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-400">새 비밀번호</Label>
                  <Input 
                    type="password"
                    value={passwordData.newPassword} 
                    onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-400">새 비밀번호 확인</Label>
                  <Input 
                    type="password"
                    value={passwordData.confirmPassword} 
                    onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={handleChangePassword} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-purple-200 text-purple-700 font-bold h-12 rounded-xl hover:bg-purple-50 transition-all"
                >
                  비밀번호 업데이트
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}