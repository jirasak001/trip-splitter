'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Member } from '@/app/trip/[id]/page'

type Props = {
  going: Member[]
  tripId: string
  onUpdate: () => void
}

export default function ExpenseForm({ going, tripId, onUpdate }: Props) {
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', paid_by: '' })
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [myName, setMyName] = useState('')  

  useEffect(() => {
    setSelectedMembers(going.map(m => m.id))
  }, [going])

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const perPerson = selectedMembers.length > 0 && newExpense.amount
    ? (Number(newExpense.amount) / selectedMembers.length).toFixed(2)
    : '0'

  const addExpense = async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.paid_by) return
    if (selectedMembers.length === 0) return

    const { data } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
        title: newExpense.title,
        amount: Number(newExpense.amount),
        paid_by: newExpense.paid_by,
        added_by_name: myName || 'ไม่ระบุ'
      })
      .select().single()

    if (data) {
      const splits = selectedMembers.map(memberId => ({
        expense_id: data.id,
        member_id: memberId,
        is_paid: memberId === newExpense.paid_by
      }))
      await supabase.from('expense_splits').insert(splits)
    }

    setNewExpense({ title: '', amount: '', paid_by: '' })
    setSelectedMembers(going.map(m => m.id))
    onUpdate()
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-4 mt-6">
      <h2 className="font-semibold mb-3">💸 เพิ่มค่าใช้จ่าย</h2>
      <div className="flex flex-col gap-3">

        <input
          className="bg-gray-700 rounded-lg p-2 outline-none"
          placeholder="ชื่อรายการ เช่น ค่าน้ำมัน"
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
        <input
            className="bg-gray-700 rounded-lg p-2 outline-none"
            placeholder="ชื่อคุณ (คนที่เพิ่มรายการนี้)"
            value={myName}
            onChange={e => setMyName(e.target.value)}
            />

        {/* เลือกคนร่วมจ่าย */}
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-sm text-gray-400 mb-2">ใครร่วมจ่ายบ้าง?</p>
          <div className="flex flex-col gap-2">
            {going.map(m => (
              <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                <input  
                  type="checkbox"
                  checked={selectedMembers.includes(m.id)}
                  onChange={() => toggleMember(m.id)}
                  className="w-4 h-4 accent-blue-500"
                />
                <span>{m.name}</span>
              </label>
            ))}
          </div>

          {selectedMembers.length > 0 && newExpense.amount && (
            <p className="text-sm text-blue-400 mt-3">
              หารกัน {selectedMembers.length} คน = คนละ ฿{perPerson}
            </p>
          )}
        </div>

        <button
          onClick={addExpense}
          className="bg-blue-600 rounded-lg p-2 font-semibold"
        >
          เพิ่มรายการ
        </button>

      </div>
    </div>
  )
}