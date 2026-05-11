import { Expense } from '@/app/trip/[id]/page'

type Props = { expenses: Expense[] }

// แปลงเวลาให้อ่านง่าย เช่น "2 ชั่วโมงที่แล้ว"
const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} วันที่แล้ว`
  if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`
  if (mins > 0) return `${mins} นาทีที่แล้ว`
  return 'เมื่อกี้'
}

export default function ActivityLog({ expenses }: Props) {
  // เรียงจากใหม่ไปเก่า
  const sorted = [...expenses].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="bg-gray-800 rounded-2xl p-4 mt-6">
      <h2 className="font-semibold mb-3">🕐 กิจกรรมล่าสุด</h2>

      {sorted.length === 0 && (
        <p className="text-gray-500">ยังไม่มีกิจกรรม</p>
      )}

      {sorted.map(e => (
        <div key={e.id} className="flex gap-3 py-3 border-b border-gray-700">
          {/* ไอคอนวงกลม */}
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm flex-shrink-0">
            💸
          </div>

          {/* ข้อมูล */}
          <div className="flex-1">
            <p className="text-sm">
              <span className="text-blue-400 font-medium">
                {e.added_by_name || 'ไม่ระบุ'}
              </span>
              {' '}เพิ่ม{' '}
              <span className="text-white font-medium">"{e.title}"</span>
              {' '}
              <span className="text-green-400">฿{e.amount.toLocaleString()}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{timeAgo(e.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}