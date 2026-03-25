'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, Ruler, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react'

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

export default function MeasurePage() {
  const { token } = useParams<{ token: string }>()
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<MeasurementData>(EMPTY)
  const [openTop, setOpenTop] = useState(true)
  const [openBottom, setOpenBottom] = useState(true)
  const [openExtra, setOpenExtra] = useState(true)
  const [notFound, setNotFound] = useState(false)

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

  const setF = (key: keyof MeasurementData, value: string | number) =>
    setForm(p => ({ ...p, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const body = {
        shoulder: form.shoulder ? parseFloat(form.shoulder) : null,
        chest: form.chest ? parseFloat(form.chest) : null,
        upperLength: form.upperLength ? parseFloat(form.upperLength) : null,
        sleeveLength: form.sleeveLength ? parseFloat(form.sleeveLength) : null,
        waist: form.waist ? parseFloat(form.waist) : null,
        hip: form.hip ? parseFloat(form.hip) : null,
        thigh: form.thigh ? parseFloat(form.thigh) : null,
        pantsLength: form.pantsLength ? parseFloat(form.pantsLength) : null,
        qtyHoodie: form.qtyHoodie,
        qtyTshirt: form.qtyTshirt,
        qtyPolo: form.qtyPolo,
        qtySweater: form.qtySweater,
        note: form.note,
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f3ff' }}>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#4B0082' }} />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6" style={{ background: '#f5f3ff' }}>
      <div className="text-5xl">❌</div>
      <h1 className="text-xl font-bold text-gray-800">유효하지 않은 QR 코드입니다</h1>
      <p className="text-gray-500 text-sm">관리자에게 문의해 주세요.</p>
    </div>
  )

  const { school } = student
  const ym = school?.yearMonth || ''
  const ymLabel = ym.length === 6 ? `${ym.slice(0, 4)}년 ${ym.slice(4)}월` : ym

  return (
    <div className="min-h-screen pb-24" style={{ background: '#f5f3ff' }}>
      {/* 상단 헤더 */}
      <div className="text-white py-6 px-5 text-center" style={{ background: 'linear-gradient(135deg, #4B0082, #6A0DAD)' }}>
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

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 상의 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4"
            onClick={() => setOpenTop(v => !v)}
          >
            <span className="flex items-center gap-2 font-bold text-gray-800">
              <Ruler className="w-4 h-4" style={{ color: '#4B0082' }} /> 상의 치수
            </span>
            {openTop ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {openTop && (
            <div className="px-5 pb-5 grid grid-cols-2 gap-4 border-t border-gray-50">
              <MField label="어깨 너비" value={form.shoulder} onChange={v => setF('shoulder', v)} />
              <MField label="가슴 둘레" value={form.chest} onChange={v => setF('chest', v)} />
              <MField label="상의 기장" value={form.upperLength} onChange={v => setF('upperLength', v)} />
              <MField label="소매 길이" value={form.sleeveLength} onChange={v => setF('sleeveLength', v)} />
            </div>
          )}
        </div>

        {/* 하의 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4"
            onClick={() => setOpenBottom(v => !v)}
          >
            <span className="flex items-center gap-2 font-bold text-gray-800">
              <Ruler className="w-4 h-4" style={{ color: '#4B0082' }} /> 하의 치수
            </span>
            {openBottom ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {openBottom && (
            <div className="px-5 pb-5 grid grid-cols-2 gap-4 border-t border-gray-50">
              <MField label="허리 둘레" value={form.waist} onChange={v => setF('waist', v)} />
              <MField label="엉덩이 둘레" value={form.hip} onChange={v => setF('hip', v)} />
              <MField label="허벅지 둘레" value={form.thigh} onChange={v => setF('thigh', v)} />
              <MField label="바지 기장" value={form.pantsLength} onChange={v => setF('pantsLength', v)} />
            </div>
          )}
        </div>

        {/* 추가 품목 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4"
            onClick={() => setOpenExtra(v => !v)}
          >
            <span className="flex items-center gap-2 font-bold text-gray-800">
              <ShoppingBag className="w-4 h-4" style={{ color: '#4B0082' }} /> 추가 품목
            </span>
            {openExtra ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {openExtra && (
            <div className="px-5 pb-5 grid grid-cols-2 gap-4 border-t border-gray-50">
              {additionalItems.map(item => (
                <div key={item.key} className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">{item.emoji} {item.label}</label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      className="px-4 py-2.5 text-gray-500 hover:bg-gray-50 text-lg font-bold"
                      onClick={() => setF(item.key, Math.max(0, (form[item.key] as number) - 1))}
                    >−</button>
                    <span className="flex-1 text-center font-semibold text-sm">{form[item.key]}</span>
                    <button
                      type="button"
                      className="px-4 py-2.5 text-white text-lg font-bold"
                      style={{ background: '#4B0082' }}
                      onClick={() => setF(item.key, (form[item.key] as number) + 1)}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 메모 */}
        <div className="bg-white rounded-2xl shadow-sm px-5 py-4 space-y-2">
          <label className="text-sm font-bold text-gray-700">메모</label>
          <textarea
            value={form.note}
            onChange={e => setF('note', e.target.value)}
            placeholder="특이사항, 체형 특성, 요청사항 등을 자유롭게 입력하세요"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      {/* 고정 하단 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-gray-100 shadow-lg">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #4B0082, #6A0DAD)' }}
        >
          {saving ? (
            <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 저장 중...</>
          ) : saved ? (
            <><CheckCircle2 className="w-5 h-5" /> 치수 수정 저장</>
          ) : (
            '치수 저장 완료'
          )}
        </button>
      </div>
    </div>
  )
}
