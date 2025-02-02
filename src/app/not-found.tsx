import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center gap-4">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404 Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400">
          요청하신 페이지를 찾을 수 없습니다.
        </p>
      </div>
      <Link href="/dashboard">
        <Button variant="default">
          홈으로 돌아가기
        </Button>
      </Link>
    </div>
  )
} 