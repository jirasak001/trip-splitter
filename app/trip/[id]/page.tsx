'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MemberList from '@/app/components/MemberList'
import ExpenseForm from '@/app/components/ExpenseForm'
import ExpenseList from '@/app/components/ExpenseList'
import DebtSummary from '@/app/components/DebtSummary'

export type Member = { id: string; name: string; is_going: boolean }
export type Expense = {
  id: string; title: string; amount: number
  paid_by: string; paid_by_name?: string
}

export default function TripPage() {
  const { id } = useParams()
  const [trip, setTrip] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [activeTab, setActiveTab] = useState('members')

  useEffect(() => {
    fetchTrip()
    fetchMembers()
    fetchExpenses()
  }, [])

  const fetchTrip = async () => {
    const { data } = await supabase.from('trips').select('*').eq('id', id).single()
    setTrip(data)
  }

  const fetchMembers = async () => {
    const { data } = await supabase.from('members').select('*').eq('trip_id', id)
    setMembers(data || [])
  }

  const fetchExpenses = async () => {
    const { data } = await supabase.from('expenses').select('*, members(name)').eq('trip_id', id)
    setExpenses((data || []).map((e: any) => ({ ...e, paid_by_name: e.members?.name })))
  }

  if (!trip) return <div className="text-white p-6">Loading...</div>

  const going = members.filter(m => m.is_going)

  const tabs = [
    { key: 'members', label: '👥 สมาชิก' },
    { key: 'expenses', label: '💸 ค่าใช้จ่าย' },
    { key: 'summary', label: '🧮 สรุปหนี้' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      
      {/* Header — ติดบนสุดตลอด */}
      <div className="bg-gray-950 px-6 pt-6 pb-3 max-w-lg mx-auto w-full">
        <h1 className="text-3xl font-bold mb-1">🧳 {trip.name}</h1>
        <p className="text-gray-400 mb-4">{trip.description}</p>

        {/* Tab Bar */}
        <div className="flex gap-2 bg-gray-800 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content — scroll ได้ */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 max-w-lg mx-auto w-full">
        {activeTab === 'members' && (
          <MemberList members={members} tripId={id as string} onUpdate={fetchMembers} />
        )}
        {activeTab === 'expenses' && (
          <>
            <ExpenseForm going={going} tripId={id as string} onUpdate={fetchExpenses} />
            <ExpenseList expenses={expenses} />
          </>
        )}
        {activeTab === 'summary' && (
          <DebtSummary going={going} expenses={expenses} />
        )}
      </div>

    </div>
  )
}