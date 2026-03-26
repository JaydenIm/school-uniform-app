'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, Ruler, ShoppingBag, ChevronDown, ChevronUp, Lock, ArrowRight, Smartphone, QrCode } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

interface MeasurementData {
  shoulder: string; chest: string; upperLength: string; sleeveLength: string;
  waist: string; hip: string; thigh: string; pantsLength: string;
  qtyHoodie: number; qtyTshirt: number; qtyPolo: number; qtySweater: number;
  note: string;
}

const EMPTY: MeasurementData = {
  shoulder: '', chest: '', upperLength: '', sleeveLength: '',
  waist: '', hip: '', thigh: '', pantsLength: '',
  qtyHoodie: 0, qtyTshirt: 0, qtyPolo: 0, qtySweater: 0,
  note: '',
}

const additionalItems = [
  { key: 'qtyHoodie', label: '후드티', emoji: '🧥' },
  { key: 'qtyTshirt', label: '반팔티', emoji: '👕' },
  { key: 'qtyPolo',   label: '폴로티', emoji: '🎽' },
  { key: 'qtySweater',label: '스웨터', emoji: '🧶' },
] as const

const MField = ({
  label, hint, value, onChange
}: { label: string; hint?: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-600">{label}</label>
    <div className="relative">
      <input
        type="number"
        min="0"
        step="0.5"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="0.0"
        className="w-full h-11 px-3 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
    </div>
    {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
  </div>
)

type Step = 'VERIFY' | 'CHOICE' | 'MEASURE'

export default function MeasurePage() {
  const { token } = useParams<{ token: string }>()
  const [step, setStep] = useState<Step>('VERIFY')
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<MeasurementData>(EMPTY)
  const [notFound, setNotFound] = useState(false)

  // 인증용 입력값
  const [inputBirth, setInputBirth] = useState('')
  const [inputGender, setInputGender] = useState<'남' | '여' | null>(null)

  // 섹션 열림 상태
  const [openTop, setOpenTop] = useState(true)
  const [openBottom, setOpenBottom] = useState(true)
  const [openExtra, setOpenExtra] = useState(true)

  useEffect(() => {
    fetch(`/api/measure/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setNotFound(true); return }
        setStudent(data.student)
        if (data.student.measurement) {
          const m = data.student.measurement
          setForm({
            shoulder: m.shoulder?.toString() || '',
            chest: m.chest?.toString() || '',
            upperLength: m.upperLength?.toString() || '',
            sleeveLength: m.sleeveLength?.toString() || '',
            waist: m.waist?.toString() || '',
            hip: m.hip?.toString() || '',
            thigh: m.thigh?.toString() || '',
            pantsLength: m.pantsLength?.toString() || '',
            qtyHoodie: m.qtyHoodie || 0,
            qtyTshirt: m.qtyTshirt || 0,
            qtyPolo: m.qtyPolo || 0,
            qtySweater: m.qtySweater || 0,
            note: m.note || '',
          })
          if (m.status === 'measured') setSaved(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [token])

  const handleVerify = () => {
    if (!inputBirth || inputBirth.length !== 8) {
      toast.error('생년월일 8자리를 입력해 주세요.')
      return
    }
    if (!inputGender) {
      toast.error('성별을 선택해 주세요.')
      return
    }

    // 간단한 클라이언트 사이드 인증 (보안을 위해 실제로는 서버에서 검증 권장)
    const dbBirth = student.birthDate?.replace(/[^0-9]/g, '')
    if (dbBirth && dbBirth !== inputBirth) {
      toast.error('입력하신 정보가 일치하지 않습니다.')
      return
    }

    setStep('CHOICE')
    toast.success('본인 확인이 완료되었습니다.')
  }

  const setF = (key: keyof MeasurementData, value: string | number) =>
    setForm(p => ({ ...p, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const body = {
        ...form,
        gender: inputGender || student.gender, // 선택한 성별 반영
        shoulder: form.shoulder ? parseFloat(form.shoulder) : null,
        chest: form.chest ? parseFloat(form.chest) : null,
        upperLength: form.upperLength ? parseFloat(form.upperLength) : null,
        sleeveLength: form.sleeveLength ? parseFloat(form.sleeveLength) : null,
        waist: form.waist ? parseFloat(form.waist) : null,
        hip: form.hip ? parseFloat(form.hip) : null,
        thigh: form.thigh ? parseFloat(form.thigh) : null,
        pantsLength: form.pantsLength ? parseFloat(form.pantsLength) : null,
      }
      const res = await fetch(`/api/measure/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('저장 실패')
      setSaved(true)
      toast.success('치수가 저장되었습니다!')
    } catch {
      toast.error('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f3ff]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-800" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6 bg-[#f5f3ff]">
      <div className="text-5xl">❌</div>
      <h1 className="text-xl font-bold text-gray-800">유효하지 않은 링크입니다</h1>
      <p className="text-gray-500 text-sm">QR 코드를 다시 스캔하거나 관리자에게 문의하세요.</p>
    </div>
  )

  const { school } = student
  const ym = school?.yearMonth || ''
  const ymLabel = ym.length === 6 ? `${ym.slice(0, 4)}년 ${ym.slice(4)}월` : ym

  // --- 1단계: 본인 인증 화면 ---
  if (step === 'VERIFY') {
    return (
      <div className="min-h-screen bg-[#f5f3ff] flex flex-col items-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden mt-10 animate-in">
          <div className="bg-gradient-to-br from-purple-800 to-indigo-900 p-8 text-center text-white">
            <h2 className="text-sm font-light tracking-[0.3em] uppercase mb-2">Verification</h2>
            <h1 className="text-2xl font-black">{student.name} 학생</h1>
            <p className="text-white/60 text-xs mt-1">{school.schoolName}</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                <Lock className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                본인 확인을 위해 정보를 입력해 주세요.<br/>
                <span className="text-[11px] text-gray-400">(생년월일 8자리 & 성별 선택)</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 px-1">생년월일 8자리</label>
                <input
                  type="number"
                  placeholder="예: 20100101"
                  className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 text-lg font-bold focus:ring-2 focus:ring-purple-500 transition-all"
                  value={inputBirth}
                  onChange={e => setInputBirth(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 px-1">성별 선택</label>
                <div className="grid grid-cols-2 gap-3">
                  {['남', '여'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setInputGender(g as any)}
                      className={`h-14 rounded-2xl font-black text-lg transition-all ${
                        inputGender === g 
                          ? 'bg-purple-600 text-white shadow-lg scale-[1.02]' 
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleVerify}
              className="w-full h-16 bg-purple-800 text-white rounded-2xl font-black text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              다음 단계로 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- 2단계: 입력 방식 선택 화면 ---
  if (step === 'CHOICE') {
    return (
      <div className="min-h-screen bg-[#f5f3ff] flex flex-col items-center p-6">
        <div className="w-full max-w-md space-y-6 mt-10 animate-in">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-gray-900">입력 방식을 선택하세요</h1>
            <p className="text-sm text-gray-500">직원이 스캔하거나 직접 입력할 수 있습니다.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl space-y-8 text-center border-t-8 border-purple-800">
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4" /> 직원 스캔용 QR 코드
              </p>
              <div className="bg-white p-4 inline-block rounded-2xl border-4 border-gray-50 shadow-inner">
                <QRCodeCanvas 
                  value={typeof window !== 'undefined' ? window.location.href : ''} 
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs text-gray-400 font-medium">
                매장 직원이 고성능 카메라로 스캔하여<br/>
                측정 데이터를 대신 입력해 드립니다.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center"><span className="bg-white px-4 text-xs font-bold text-gray-300">OR</span></div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <Smartphone className="w-4 h-4" /> 모바일 직접 입력
              </p>
              <button
                onClick={() => setStep('MEASURE')}
                className="w-full h-16 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                본인 스마트폰으로 입력 <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- 3단계: 치수 입력 화면 (기존 루프) ---
  return (
    <div className="min-h-screen pb-24 bg-[#f5f3ff]">
      <div className="text-white py-6 px-5 text-center bg-gradient-to-br from-purple-800 to-indigo-900">
        <div className="text-lg font-light tracking-widest mb-1">On<span className="font-extrabold">Fit</span></div>
        <h1 className="text-2xl font-bold">{student.name}</h1>
        <p className="text-white/70 text-sm mt-1">
          {school?.schoolName} · {student.grade && `${student.grade}학년`} {student.class && `${student.class}반`} · {ymLabel}
        </p>
        {saved && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> 치수 입력 완료
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 animate-in">
        {/* 상의 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <button className="w-full flex items-center justify-between px-5 py-4" onClick={() => setOpenTop(v => !v)}>
            <span className="flex items-center gap-2 font-bold text-gray-800">
              <Ruler className="w-4 h-4 text-purple-800" /> 상의 치수
            </span>
            {openTop ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {openTop && (
            <div className="px-5 pb-5 grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
              <MField label="어깨 너비" value={form.shoulder} onChange={v => setF('shoulder', v)} />
              <MField label="가슴 둘레" value={form.chest} onChange={v => setF('chest', v)} />
              <MField label="상의 기장" value={form.upperLength} onChange={v => setF('upperLength', v)} />
              <MField label="소매 길이" value={form.sleeveLength} onChange={v => setF('sleeveLength', v)} />
            </div>
          )}
        </div>

        {/* 하의 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <button className="w-full flex items-center justify-between px-5 py-4" onClick={() => setOpenBottom(v => !v)}>
            <span className="flex items-center gap-2 font-bold text-gray-800">
              <Ruler className="w-4 h-4 text-purple-800" /> 하의 치수
            </span>
            {openBottom ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {openBottom && (
            <div className="px-5 pb-5 grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
              <MField label="허리 둘레" value={form.waist} onChange={v => setF('waist', v)} />
              <MField label="엉덩이 둘레" value={form.hip} onChange={v => setF('hip', v)} />
              <MField label="허벅지 둘레" value={form.thigh} onChange={v => setF('thigh', v)} />
              <MField label="바지 기장" value={form.pantsLength} onChange={v => setF('pantsLength', v)} />
            </div>
          )}
        </div>

        {/* 추가 품목 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <button className="w-full flex items-center justify-between px-5 py-4" onClick={() => setOpenExtra(v => !v)}>
            <span className="flex items-center gap-2 font-bold text-gray-800">
              <ShoppingBag className="w-4 h-4 text-purple-800" /> 추가 품목
            </span>
            {openExtra ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {openExtra && (
            <div className="px-5 pb-5 grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
              {additionalItems.map(item => (
                <div key={item.key} className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">{item.emoji} {item.label}</label>
                  <div className="flex items-center border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                    <button
                      type="button"
                      className="px-4 py-3 text-gray-400 hover:text-gray-600 font-bold"
                      onClick={() => setF(item.key, Math.max(0, (form[item.key] as number) - 1))}
                    >−</button>
                    <span className="flex-1 text-center font-black text-sm">{form[item.key]}</span>
                    <button
                      type="button"
                      className="px-4 py-3 bg-purple-800 text-white font-bold"
                      onClick={() => setF(item.key, (form[item.key] as number) + 1)}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 메모 */}
        <div className="bg-white rounded-2xl shadow-sm px-6 py-5 space-y-3 border border-gray-100">
          <label className="text-sm font-black text-gray-700">추가 요청사항 (메모)</label>
          <textarea
            value={form.note}
            onChange={e => setF('note', e.target.value)}
            placeholder="특이사항이나 요청사항을 입력해 주세요."
            rows={3}
            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 py-6 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-2xl">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-16 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 shadow-lg bg-gradient-to-r from-purple-800 to-indigo-900"
        >
          {saving ? (
            <><span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> 저장 중...</>
          ) : saved ? (
            <><CheckCircle2 className="w-6 h-6" /> 치수 정보 수정하기</>
          ) : (
            '측정 데이터 저장 완료'
          )}
        </button>
      </div>
    </div>
  )
}
