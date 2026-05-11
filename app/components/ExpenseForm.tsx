'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Member } from '@/app/trip/[id]/page'

type Props = {
  going: Member[]
  tripId: string
  onUpdate: () => void
}

export default function ExpenseForm({ going, tripId, onUpdate }: Props) {
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', paid_by: '' })

  const addExpense = async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.paid_by) return

    const { data } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
        title: newExpense.title,
        amount: Number(newExpense.amount),
        paid_by: newExpense.paid_by
      })
      .select().single()

    if (data) {
      const splits = going.map(m => ({
        expense_id: data.id,
        member_id: m.id,
        is_paid: m.id === newExpense.paid_by
      }))
      await supabase.from('expense_splits').insert(splits)
    }

    setNewExpense({ title: '', amount: '', paid_by: '' })
    onUpdate()
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-4 mt-6">
      <h2 className="font-semibold mb-3">💸 เพิ่มค่าใช้จ่าย</h2>
      <div className="flex flex-col gap-2">
        <input
          className="bg-gray-700 rounded-lg p-2 outline-none"
          placeholder="ชื่อรายการ เช่น ค่าโรงแรม"
          value={newExpense.title}
          onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
        />
        <input
          className="bg-gray-700 rounded-lg p-2 outline-none"
          placeholder="จำนวนเงิน"
          type="number"
          value={newExpense.amount}
          onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
        />
        <select
          className="bg-gray-700 rounded-lg p-2 outline-none"
          value={newExpense.paid_by}
          onChange={e => setNewExpense({ ...newExpense, paid_by: e.target.value })}
        >
          <option value="">ใครจ่าย?</option>
          {going.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <button onClick={addExpense} className="bg-blue-600 rounded-lg p-2 font-semibold">
          เพิ่มรายการ
        </button>
      </div>
    </div>
  )
}
