'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')

    if (!email.trim() || !password.trim()) {
      setMessage('กรุณากรอก email และ password ให้ครบ')
      setLoading(false)
      return
    }

    if (!validateEmail(email)) {
      setMessage('รูปแบบ email ไม่ถูกต้อง')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        const errCode = (error as any)?.code || ''
        const errMsg = error?.message || ''
        const isEmailSignupDisabled =
          errMsg.includes('Email signups are disabled') ||
          errMsg.includes('email_provider_disabled') ||
          errCode === 'email_provider_disabled'

        if (error || !data?.user) {
          if (isEmailSignupDisabled) {
            setMessage('ระบบยังไม่เปิดให้สมัครด้วยอีเมล โปรดเปิด Email signups ใน Supabase dashboard หรือเข้าสู่ระบบด้วยบัญชีที่มีอยู่')
          } else if (error?.message) {
            setMessage(error.message)
          } else {
            setMessage('ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง')
          }
        } else {
          setMessage('การสมัครสำเร็จ! กรุณาเข้าสู่ระบบด้วยบัญชีที่สมัครใหม่')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setMessage(error.message)
        else router.push('/')
      }
    } catch (error) {
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ ลองใหม่อีกครั้ง')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-2 text-center">🧳 Trip Splitter</h1>
        <p className="text-gray-400 text-center mb-8">
          {isSignUp ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ'}
        </p>
        <div className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-3">
          <input
            className="bg-gray-700 rounded-lg p-3 outline-none"
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="bg-gray-700 rounded-lg p-3 outline-none"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
          />
          {message && (
            <p className="text-sm text-yellow-400 text-center">{message}</p>
          )}
          <button
            onClick={handleAuth}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 rounded-lg p-3 font-semibold disabled:opacity-50"
          >
            {loading ? 'กำลังดำเนินการ...' : isSignUp ? 'สมัคร' : 'เข้าสู่ระบบ'}
          </button>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-400 text-sm text-center hover:text-white"
          >
            {isSignUp ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครเลย'}
          </button>
        </div>
      </div>
    </main>
  )
}