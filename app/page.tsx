'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [tripName, setTripName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const createTrip = async () => {
    if (!tripName.trim()) return
    setLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .insert({ name: tripName, description })
      .select()
      .single()

    if (data) router.push(`/trip/${data.id}`)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6">
      <h1 className="text-4xl font-bold mb-2">🧳 Trip Splitter</h1>
      <p className="text-gray-400 mb-8">หารค่าใช้จ่ายกับเพื่อนแบบง่ายๆ</p>

      <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md flex flex-col gap-4">
        <input
          className="bg-gray-700 rounded-lg p-3 outline-none"
          placeholder="ชื่อทริป เช่น เที่ยวเชียงใหม่"
          value={tripName}
          onChange={e => setTripName(e.target.value)}
        />
        <input
          className="bg-gray-700 rounded-lg p-3 outline-none"
          placeholder="รายละเอียด (ไม่บังคับ)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button
          onClick={createTrip}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 rounded-lg p-3 font-semibold disabled:opacity-50"
        >
          {loading ? 'กำลังสร้าง...' : 'สร้างทริป'}
        </button>
      </div>
    </main>
  )
}