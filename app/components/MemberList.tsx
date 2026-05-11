'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Member } from '@/app/trip/[id]/page'

type Props = {
  members: Member[]
  tripId: string
  onUpdate: () => void  // บอกหน้าแม่ให้ดึงข้อมูลใหม่
}

export default function MemberList({ members, tripId, onUpdate }: Props) {
  const [newName, setNewName] = useState('')

  const addMember = async () => {
    if (!newName.trim()) return
    await supabase.from('members').insert({ trip_id: tripId, name: newName })
    setNewName('')
    onUpdate()
  }

  const toggleGoing = async (member: Member) => {
    await supabase.from('members').update({ is_going: !member.is_going }).eq('id', member.id)
    onUpdate()
  }

  const going = members.filter(m => m.is_going)

  return (
    <>
      <div className="bg-gray-800 rounded-2xl p-4 mb-6">
        <h2 className="font-semibold mb-3">เพิ่มสมาชิก</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-gray-700 rounded-lg p-2 outline-none"
            placeholder="ชื่อเพื่อน"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMember()}
          />
          <button onClick={addMember} className="bg-blue-600 px-4 rounded-lg">เพิ่ม</button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-4">
        <h2 className="font-semibold mb-3">สมาชิก ({going.length}/{members.length} คนไป)</h2>
        {members.map(m => (
          <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-700">
            <span className={m.is_going ? 'text-white' : 'text-gray-500 line-through'}>{m.name}</span>
            <button
              onClick={() => toggleGoing(m)}
              className={`px-3 py-1 rounded-full text-sm ${m.is_going ? 'bg-green-600' : 'bg-gray-600'}`}
            >
              {m.is_going ? '✅ ไป' : '❌ ไม่ไป'}
            </button>
          </div>
        ))}
      </div>
    </>
  )
}