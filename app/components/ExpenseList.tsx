import { supabase } from '@/lib/supabase'
import { Expense, Split, Member } from '@/app/trip/[id]/page'

type Props = {
  expenses: Expense[]
  splits: Split[]
  going: Member[]
  onUpdate: () => void  // เพิ่ม prop นี้
}

export default function ExpenseList({ expenses, splits, going, onUpdate }: Props) {

  const deleteExpense = async (expenseId: string) => {
    if (!window.confirm('ลบรายการนี้ใช่ไหม?')) return
    // ลบ splits ก่อน แล้วค่อยลบ expense
    await supabase.from('expense_splits').delete().eq('expense_id', expenseId)
    await supabase.from('expenses').delete().eq('id', expenseId)
    onUpdate()
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-4 mt-6">
      <h2 className="font-semibold mb-3">📋 รายการทั้งหมด</h2>
      {expenses.length === 0 && <p className="text-gray-500">ยังไม่มีรายการ</p>}
      {expenses.map(e => {
        const expenseSplits = splits.filter(s => s.expense_id === e.id)
        const splitCount = expenseSplits.length
        const perPerson = splitCount > 0 ? e.amount / splitCount : 0
        const splitNames = expenseSplits
          .map(s => going.find(m => m.id === s.member_id)?.name)
          .filter(Boolean)
          .join(', ')

        return (
          <div key={e.id} className="py-3 border-b border-gray-700 last:border-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">{e.title}</p>
                <p className="text-sm text-gray-400">{e.paid_by_name} จ่าย</p>
                {splitCount > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    หาร {splitCount} คน (฿{perPerson.toFixed(0)}/คน) · {splitNames}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 ml-2">
                <p className="text-green-400 font-semibold">฿{e.amount.toLocaleString()}</p>
                <button
                  onClick={() => deleteExpense(e.id)}
                  className="text-slate-500 hover:text-red-400 transition text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}