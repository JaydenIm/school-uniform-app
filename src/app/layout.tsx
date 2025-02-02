import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="flex h-screen">
          {session && (  // 로그인된 경우에만 left menu 표시
            <div className="w-64 bg-black text-white p-6">
              {/* Left Menu 내용 */}
            </div>
          )}
          <main className={`flex-1 ${session ? 'ml-64' : ''}`}>
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
