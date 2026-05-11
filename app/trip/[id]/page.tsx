'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
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
  members?: {
    name: string
  }
}

export default function TripPage() {
  const params = useParams()
  const id = params.id as string

  const [trip, setTrip] = useState<Record<string, unknown> | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [splits, setSplits] = useState<Split[]>([])
  const [activeTab, setActiveTab] = useState('members')

  const fetchTrip = useCallback(async () => {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single()

    setTrip(data)
  }, [id])

  const fetchMembers = useCallback(async () => {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('trip_id', id)

    setMembers(data || [])
  }, [id])

  const fetchExpenses = useCallback(async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*, members(name)')
      .eq('trip_id', id)

    const formatted: Expense[] = ((data || []) as ExpenseWithMember[]).map((e) => ({
      ...e,
      paid_by_name: e.members?.name
    }))

    setExpenses(formatted)

    if (formatted.length > 0) {
      const { data: splitData } = await supabase
        .from('expense_splits')
        .select('*')
        .in(
          'expense_id',
          formatted.map((e) => e.id)
        )

      setSplits(splitData || [])
    } else {
      setSplits([])
    }
  }, [id])

  useEffect(() => {
    fetchTrip()
    fetchMembers()
    fetchExpenses()
  }, [fetchTrip, fetchMembers, fetchExpenses])

  if (!trip) {
    return <div className="text-white p-6">Loading...</div>
  }

  const going = members.filter((m) => m.is_going)

  const tabs = [
    { key: 'members', label: '👥 สมาชิก' },
    { key: 'expenses', label: '💸 ค่าใช้จ่าย' },
    { key: 'summary', label: '🧮 สรุปหนี้' },
    { key: 'activity', label: '🕐 กิจกรรม' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-950 px-6 pt-6 pb-3 max-w-lg mx-auto w-full">
        <h1 className="text-3xl font-bold mb-1">
          🧳 {(trip.name as string) || 'Trip'}
        </h1>

        <p className="text-gray-400 mb-4">
          {(trip.description as string) || ''}
        </p>

        {/* Tab Bar */}
        <div className="flex gap-2 bg-gray-800 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 max-w-lg mx-auto w-full">
        {activeTab === 'members' && (
          <MemberList
            members={members}
            tripId={id}
            onUpdate={fetchMembers}
          />
        )}

        {activeTab === 'expenses' && (
          <>
            <ExpenseForm
              going={going}
              tripId={id}
              onUpdate={fetchExpenses}
            />

            <ExpenseList
              expenses={expenses}
              splits={splits}
              going={going}
            />
          </>
        )}

        {activeTab === 'summary' && (
          <DebtSummary
            going={going}
            expenses={expenses}
            splits={splits}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityLog expenses={expenses} />
        )}
      </div>
    </div>
  )
}