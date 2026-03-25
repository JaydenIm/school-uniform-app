import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen flex ${inter.className}`}>
      {/* 왼쪽: OnFit 브랜드 섹션 */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4B0082 0%, #6A0DAD 60%, #7B20C0 100%)' }}
      >
        {/* 배경 장식 원 */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10" style={{ background: '#ffffff' }} />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full opacity-10" style={{ background: '#EBE0FF' }} />
        <div className="absolute top-1/3 right-8 w-40 h-40 rounded-full opacity-5" style={{ background: '#ffffff' }} />

        <div className="relative max-w-md text-white text-center px-8 z-10">
          {/* OnFit 로고 */}
          <div className="brand-logo text-6xl mb-4 tracking-tight">
            <span className="brand-on font-light">On</span><span className="brand-fit font-extrabold">Fit</span>
          </div>
          <div className="text-lg font-light text-white/60 mb-6 tracking-widest">온핏</div>

          {/* 구분선 */}
          <div className="w-16 h-[1px] bg-white/30 mx-auto mb-6" />

          <p className="text-base text-white/70 leading-relaxed">
            교복 관리의 새로운 기준<br />
            <span className="text-white font-semibold">온라인의 편리함, 딱 맞춤의 정확성</span>
          </p>

          {/* 특징 배지 */}
          <div className="flex justify-center gap-2 mt-8">
            {['학교 관리', '학생 명단', '교복 주문'].map(tag => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full border border-white/20 text-white/60">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽: 폼 영역 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        {/* 모바일용 로고 */}
        <div className="absolute top-6 left-6 lg:hidden">
          <div className="brand-logo text-2xl" style={{ color: '#4B0082' }}>
            <span className="brand-on font-light">On</span><span className="brand-fit font-extrabold">Fit</span>
          </div>
        </div>
        {children}
      </div>
      <Toaster richColors />
    </div>
  );
}