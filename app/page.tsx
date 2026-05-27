'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Trip = {
  id: string
  name: string
  description: string
  created_at: string
}

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripName, setTripName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const [currentUserId, setCurrentUserId] = useState('')

  useEffect(() => {
    fetchTrips()
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUserEmail(user?.email || '')
    setCurrentUserId(user?.id || '')
  }
  const deleteTrip = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation() // ไม่ให้ navigate เข้าทริป
    if (!window.confirm('ลบทริปนี้ใช่ไหม? ข้อมูลทั้งหมดจะหายไป')) return
    await supabase.from('trips').delete().eq('id', tripId)
    fetchTrips()
  }
  const fetchTrips = async () => {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false })
    setTrips(data || [])
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const createTrip = async () => {
    if (!tripName.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { data } = await supabase
      .from('trips')
      .insert({ name: tripName, description, owner_id: user?.id })
      .select()
      .single()

    if (data) {
      // เพิ่มเจ้าของเป็น member อัตโนมัติ
      await supabase.from('members').insert({ 
        trip_id: data.id,
        user_id: user?.id,
        name: user?.email,
        is_going: true
      })
      router.push(`/trip/${data.id}`)
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-12 px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/10 shadow-2xl shadow-cyan-500/10 mx-auto w-full max-w-2xl px-4 py-7 mt-8 sm:px-6 sm:py-8">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -left-16 bottom-6 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70 mb-3">Trip Splitter</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              สวัสดี 👋
            </h1>
            {/* แสดง email ผู้ใช้ */}
            <p className="mt-2 text-cyan-300 font-medium">{userEmail}</p>
            <p className="mt-2 text-slate-300 text-sm leading-7 sm:text-base">
              บันทึกทริป จัดสมาชิก และแชร์ค่าใช้จ่ายกับเพื่อน ๆ ได้ง่ายในที่เดียว
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            ออกจากระบบ
          </button>
        </div>

        {/* Stats — เหลือแค่จำนวนทริป */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">ทริปทั้งหมด</p>
            <p className="mt-3 text-3xl font-semibold text-white">{trips.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">สร้างทริปใหม่ได้เลย</p>
            <p className="mt-3 text-xl font-semibold text-cyan-300">เร็วและง่าย ⚡</p>
          </div>
        </div>
      </div>

      {/* ส่วนล่าง — เหมือนเดิม */}
      <div className="mx-auto mt-8 w-full max-w-2xl">
        <section className="mb-8 rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">ทริปล่าสุด</h2>
              <p className="mt-2 text-slate-400">เลือกทริปที่มีอยู่แล้วหรือสร้างใหม่ได้ทันที</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 sm:w-auto"
            >
              + สร้างทริปใหม่
            </button>
          </div>
        </section>

        <section className="grid gap-4">
          {trips.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
              <p className="text-lg font-semibold text-white mb-3">ยังไม่มีทริป</p>
              <p className="max-w-sm mx-auto">เริ่มต้นด้วยการสร้างทริปแรกของคุณ</p>
            </div>
          ) : (
            trips.map(trip => (
              <div key={trip.id} className="relative group rounded-[1.75rem] border border-white/10 bg-slate-900/80 transition hover:-translate-y-1 hover:border-cyan-500/40 hover:bg-slate-800/95">
                <button
                  onClick={() => router.push(`/trip/${trip.id}`)}
                  className="w-full p-6 text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{trip.name}</p>
                      {trip.description && (
                        <p className="mt-2 text-slate-400">{trip.description}</p>
                      )}
                    </div>
                    <span className="text-2xl text-cyan-400">›</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">
                    สร้างเมื่อ {new Date(trip.created_at).toLocaleDateString('th-TH', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </button>

                {/* ปุ่มลบ — แสดงเฉพาะเจ้าของ */}
                {(trip as any).owner_id === currentUserId && (
                  <button
                    onClick={(e) => deleteTrip(e, trip.id)}
                    className="absolute top-20 right-4 text-slate-500 hover:text-red-400 transition text-sm px-2 py-1 rounded-lg hover:bg-red-900/20"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))
          )}
        </section>

        {showForm && (
          <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900/90 p-5 shadow-xl sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">สร้างทริปใหม่</h2>
                <p className="mt-2 text-slate-400">กรอกข้อมูลแล้วเริ่มจัดทริปได้เลย</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                ยกเลิก
              </button>
            </div>
            <div className="grid gap-4">
              <input
                className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                placeholder="ชื่อทริป เช่น เที่ยวเชียงใหม่"
                value={tripName}
                onChange={e => setTripName(e.target.value)}
              />
              <input
                className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                placeholder="รายละเอียด (ไม่บังคับ)"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <button
              onClick={createTrip}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {loading ? 'กำลังสร้าง...' : 'สร้างทริป'}
            </button>
          </section>
        )}
      </div>
    </main>
  )
}