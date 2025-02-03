'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Nav } from "@/components/ui/nav"
import { Sidebar } from "@/components/ui/sidebar-07"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/",
    icon: "dashboard",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: "analytics",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "reports",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: "customers",
  },
  {
    title: "Orders",
    href: "/orders",
    icon: "orders",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "settings",
  },
]

interface Board {
  id: number;
  title: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated') {
      // 첫 방문 체크
      const hasVisited = localStorage.getItem('hasVisitedDashboard');
      if (!hasVisited && session?.user?.name) {
        toast.success(`환영합니다, ${session.user.name}님!`);
        localStorage.setItem('hasVisitedDashboard', 'true');
      }

      // 게시판 데이터 로드
      const fetchBoards = async () => {
        try {
          const response = await fetch('/api/boards', {
            credentials: 'include'
          });
          if (!response.ok) throw new Error('Failed to fetch boards');
          const data = await response.json();
          setBoards(data.slice(0, 5));
        } catch (error) {
          console.error('Error fetching boards:', error);
        }
      };

      fetchBoards();
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">최근 게시글</h2>
              <div className="space-y-2">
                {boards.length > 0 ? (
                  <div className="space-y-2">
                    {boards.map(board => (
                      <div key={board.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                        <span className="text-gray-700 truncate flex-1">{board.title}</span>
                        <span className="text-gray-500 ml-4">
                          {new Date(board.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">등록된 게시글이 없습니다.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-medium mb-4">최근 활동</h3>
              <p className="text-gray-600">아직 활동 내역이 없습니다.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-medium mb-4">통계</h3>
              <p className="text-gray-600">데이터를 불러오는 중...</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-medium mb-4">알림</h3>
              <p className="text-gray-600">새로운 알림이 없습니다.</p>
            </div>
          </div>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subscriptions
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Now
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardContent>
              <RecentSales />
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}