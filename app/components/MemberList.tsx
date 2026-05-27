'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Member } from '@/app/trip/[id]/page'
import { useRouter } from 'next/navigation'

type Props = {
  members: Member[]
  tripId: string
  onUpdate: () => void
}

export default function MemberList({ members, tripId, onUpdate }: Props) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const router = useRouter() 

  const going = members.filter(m => m.is_going)

  const createInviteLink = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data } = await supabase
      .from('invites')
      .insert({ trip_id: tripId, created_by: user?.id })
      .select()
      .single()

    if (data) {
      const link = `${window.location.origin}/join/${data.token}`
      setInviteLink(link)
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
    setLoading(false)
  }

  const toggleGoing = async (member: Member) => {
    await supabase.from('members').update({ is_going: !member.is_going }).eq('id', member.id)
    onUpdate()
  }

  const leaveTrip = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const confirm = window.confirm('ต้องการออกจากทริปนี้ใช่ไหม?')
    if (!confirm) return

    await supabase
      .from('members')
      .delete()
      .eq('trip_id', tripId)
      .eq('user_id', user.id)

    router.push('/')
  }

  return (
    <>
      {/* Invite Box */}
      <div className="bg-gray-800 rounded-2xl p-4 mb-4">
        <h2 className="font-semibold mb-1">เชิญเพื่อนเข้าร่วม</h2>
        <p className="text-gray-400 text-sm mb-3">สร้างลิงค์แล้วส่งให้เพื่อน — เพื่อนกดลิงค์แล้วจะเข้าร่วมทริปนี้ได้เลย</p>

        <button
          onClick={createInviteLink}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl p-3 font-semibold flex items-center justify-center gap-2"
        >
          {loading ? 'กำลังสร้าง...' : copied ? '✅ คัดลอกแล้ว!' : '🔗 สร้างและคัดลอกลิงค์เชิญ'}
        </button>

        {inviteLink && (
          <div className="mt-3 bg-gray-700 rounded-lg p-3 text-xs text-gray-300 break-all">
            {inviteLink}
          </div>
        )}
      </div>

      {/* Member List */}
      <div className="bg-gray-800 rounded-2xl p-4">
        <h2 className="font-semibold mb-3">สมาชิก ({going.length}/{members.length} คนไป)</h2>

        {members.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">ยังไม่มีสมาชิก — เชิญเพื่อนด้วยลิงค์ด้านบน</p>
        )}

        {members.map(m => (
          <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
            <span className={m.is_going ? 'text-white' : 'text-gray-500 line-through'}>
              {m.name}
            </span>
            <button
              onClick={() => toggleGoing(m)}
              className={`px-3 py-1 rounded-full text-sm ${m.is_going ? 'bg-green-600' : 'bg-gray-600'}`}
            >
              {m.is_going ? '✅ ไป' : '❌ ไม่ไป'}
            </button>
          </div>
        ))}
      </div>
      {/* ปุ่มออกจากทริป */}
      <div className="mt-4">
        <button
          onClick={leaveTrip}
          className="w-full bg-gray-700 hover:bg-red-900/50 border border-red-500/30 hover:border-red-500/60 text-red-400 rounded-xl p-3 text-sm font-medium transition"
        >
          🚪 ออกจากทริปนี้
        </button>
      </div>
    </>
  )
}