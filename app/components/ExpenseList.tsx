import { Expense, Split, Member } from '@/app/trip/[id]/page'

type Props = {
  expenses: Expense[]
  splits: Split[]
  going: Member[]
}

export default function ExpenseList({ expenses, splits, going }: Props) {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 mt-6">
      <h2 className="font-semibold mb-3">📋 รายการทั้งหมด</h2>
      {expenses.length === 0 && <p className="text-gray-500">ยังไม่มีรายการ</p>}
      {expenses.map(e => {
        // หาว่าใครร่วมจ่ายในรายการนี้บ้าง
        const expenseSplits = splits.filter(s => s.expense_id === e.id)
        const splitCount = expenseSplits.length
        const perPerson = splitCount > 0 ? e.amount / splitCount : 0

        // หาชื่อคนที่ร่วมจ่าย
        const splitNames = expenseSplits
          .map(s => going.find(m => m.id === s.member_id)?.name)
          .filter(Boolean)
          .join(', ')

        return (
          <div key={e.id} className="py-3 border-b border-gray-700">
            <div className="flex justify-between">
              <p className="font-medium">{e.title}</p>
              <p className="text-green-400 font-semibold">฿{e.amount.toLocaleString()}</p>
            </div>
            <p className="text-sm text-gray-400">{e.paid_by_name} จ่าย</p>
            {splitCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                หาร {splitCount} คน (฿{perPerson.toFixed(0)}/คน) · {splitNames}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}