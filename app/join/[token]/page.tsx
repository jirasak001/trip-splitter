'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function JoinPage() {
  const { token } = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [tripName, setTripName] = useState('')

  useEffect(() => {
    joinTrip()
  }, [])

  const joinTrip = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      localStorage.setItem('pendingInvite', token as string)
      router.push('/login')
      return
    }

    const { data: invite } = await supabase
      .from('invites')
      .select('*, trips(name)')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!invite) {
      setStatus('error')
      return
    }

    setTripName((invite.trips as any).name)

    // เช็คว่าเป็น member แล้วหรือยัง
    const { data: existingList } = await supabase
    .from('members')
    .select('id')
    .eq('trip_id', invite.trip_id)
    .eq('user_id', user.id)

    const existing = existingList?.[0]

    if (!existing) {
      await supabase.from('members').insert({
        trip_id: invite.trip_id,
        user_id: user.id,
        name: user.email,
        is_going: true
      })
    }

    setStatus('success')
    setTimeout(() => router.push(`/trip/${invite.trip_id}`), 1500)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="text-4xl mb-4">🧳</div>
            <p className="text-gray-400">กำลังเข้าร่วมทริป...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold mb-2">เข้าร่วม "{tripName}" สำเร็จ!</h2>
            <p className="text-gray-400">กำลังพาไปหน้าทริป...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2">ลิงค์ไม่ถูกต้องหรือหมดอายุแล้ว</h2>
            <button onClick={() => router.push('/')}
              className="mt-4 bg-blue-600 rounded-lg px-6 py-2">
              กลับหน้าหลัก
            </button>
          </>
        )}
      </div>
    </main>
  )
}