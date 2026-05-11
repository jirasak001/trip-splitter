'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Member = { id: string; name: string; is_going: boolean }

export default function TripPage() {
  const { id } = useParams()
  const [trip, setTrip] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [newName, setNewName] = useState('')

  useEffect(() => {
    fetchTrip()
    fetchMembers()
  }, [])

  const fetchTrip = async () => {
    const { data } = await supabase.from('trips').select('*').eq('id', id).single()
    setTrip(data)
  }

  const fetchMembers = async () => {
    const { data } = await supabase.from('members').select('*').eq('trip_id', id)
    setMembers(data || [])
  }

  const addMember = async () => {
    if (!newName.trim()) return
    await supabase.from('members').insert({ trip_id: id, name: newName })
    setNewName('')
    fetchMembers()
  }

  const toggleGoing = async (member: Member) => {
    await supabase.from('members').update({ is_going: !member.is_going }).eq('id', member.id)
    fetchMembers()
  }

  if (!trip) return <div className="text-white p-6">Loading...</div>

  const going = members.filter(m => m.is_going)

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-1">🧳 {trip.name}</h1>
      <p className="text-gray-400 mb-6">{trip.description}</p>

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
    </main>
  )
}