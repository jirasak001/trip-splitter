'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MemberList from '@/app/components/MemberList'
import ExpenseForm from '@/app/components/ExpenseForm'
import ExpenseList from '@/app/components/ExpenseList'
import DebtSummary from '@/app/components/DebtSummary'
import ActivityLog from '@/app/components/ActivityLog'

export type Member = {
  id: string
  name: string
  is_going: boolean
}

export type Expense = {
  id: string
  title: string
  amount: number
  paid_by: string
  paid_by_name?: string
  added_by_name?: string
  created_at: string
}

export type Split = {
  expense_id: string
  member_id: string
  is_paid: boolean
}

type ExpenseWithMember = Expense & {
  members?: { name: string }
}

export default function TripPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [trip, setTrip] = useState<Record<string, unknown> | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [splits, setSplits] = useState<Split[]>([])
  const [activeTab, setActiveTab] = useState('members')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')

  const fetchTrip = useCallback(async () => {
    const { data } = await supabase.from('trips').select('*').eq('id', id).single()
    setTrip(data)

    if (data?.owner_id) {
      // เช็ค current user ก่อน
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.id === data.owner_id) {
        // ถ้าเป็นเจ้าของเอง ใช้ email ได้เลย
        setOwnerEmail(user?.email ?? '')
      } else {
        // ดึงจาก members ของทริปนี้
        const { data: memberData } = await supabase
          .from('members')
          .select('name')
          .eq('trip_id', id)
          .eq('user_id', data.owner_id)
          .maybeSingle()

        setOwnerEmail(memberData?.name || 'ไม่ทราบ')
      }
    }
  }, [id])

  const fetchCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || '')
  }, [])

  const fetchMembers = useCallback(async () => {
    const { data } = await supabase.from('members').select('*').eq('trip_id', id)
    setMembers(data || [])
  }, [id])

  const fetchExpenses = useCallback(async () => {
    const { data } = await supabase.from('expenses').select('*, members(name)').eq('trip_id', id)
    const formatted: Expense[] = ((data || []) as ExpenseWithMember[]).map((e) => ({
      ...e,
      paid_by_name: e.members?.name
    }))
    setExpenses(formatted)
    if (formatted.length > 0) {
      const { data: splitData } = await supabase
        .from('expense_splits').select('*')
        .in('expense_id', formatted.map((e) => e.id))
      setSplits(splitData || [])
    } else {
      setSplits([])
    }
  }, [id])

  useEffect(() => {
    fetchTrip()
    fetchMembers()
    fetchExpenses()
    fetchCurrentUser()
  }, [fetchTrip, fetchMembers, fetchExpenses, fetchCurrentUser])

  if (!trip) return <div className="text-white p-6">Loading...</div>

  const going = members.filter((m) => m.is_going)
  const isOwner = currentUserId === (trip.owner_id as string)

  const tabs = [
    { key: 'members', label: '👥 สมาชิก' },
    { key: 'expenses', label: '💸 ค่าใช้จ่าย' },
    { key: 'summary', label: '🧮 สรุปหนี้' },
    { key: 'activity', label: '🕐 กิจกรรม' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="bg-gray-950 px-6 pt-6 pb-3 max-w-lg mx-auto w-full">

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← กลับหน้าหลัก
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/login')
            }}
            className="text-gray-400 hover:text-white text-sm"
          >
            ออกจากระบบ
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-1">
          🧳 {(trip.name as string) || 'Trip'}+
        </h1>

        {/* แสดงหัวหน้าทริป */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
            👑 หัวหน้าทริป
          </span>
          <span className="text-sm text-gray-300">
            {ownerEmail || 'ไม่ทราบ'}
          </span>
          {isOwner && (
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
              (คุณ)
            </span>
          )}
        </div>

        <p className="text-gray-400 mb-4">
          {(trip.description as string) || ''}
        </p>

        <div className="flex gap-2 bg-gray-800 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 max-w-lg mx-auto w-full">
        {activeTab === 'members' && (
          <MemberList members={members} tripId={id} onUpdate={fetchMembers} />
        )}
        {activeTab === 'expenses' && (
          <>
            <ExpenseForm going={going} tripId={id} onUpdate={fetchExpenses} />
            <ExpenseList expenses={expenses} splits={splits} going={going} onUpdate={fetchExpenses}  />
          </>
        )}
        {activeTab === 'summary' && (
          <DebtSummary going={going} expenses={expenses} splits={splits} />
        )}
        {activeTab === 'activity' && (
          <ActivityLog expenses={expenses} />
        )}
      </div>
    </div>
  )
}