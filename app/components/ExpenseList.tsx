import { Expense } from '@/app/trip/[id]/page'

type Props = { expenses: Expense[] }

export default function ExpenseList({ expenses }: Props) {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 mt-6">
      <h2 className="font-semibold mb-3">📋 รายการทั้งหมด</h2>
      {expenses.length === 0 && <p className="text-gray-500">ยังไม่มีรายการ</p>}
      {expenses.map(e => (
        <div key={e.id} className="flex justify-between py-2 border-b border-gray-700">
          <div>
            <p>{e.title}</p>
            <p className="text-sm text-gray-400">{e.paid_by_name} จ่าย</p>
          </div>
          <p className="text-green-400 font-semibold">฿{e.amount.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}