import { Member, Expense } from '@/app/trip/[id]/page'

type Props = { going: Member[]; expenses: Expense[] }

export default function DebtSummary({ going, expenses }: Props) {
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
  const perPerson = going.length > 0 ? totalAmount / going.length : 0

  // คำนวณยอด balance ของแต่ละคน
  const paid: Record<string, number> = {}
  going.forEach(m => { paid[m.id] = 0 })
  expenses.forEach(e => {
    if (paid[e.paid_by] !== undefined) paid[e.paid_by] += e.amount
  })

  const owes: Record<string, number> = {}
  going.forEach(m => { owes[m.id] = paid[m.id] - perPerson })

  // คำนวณว่าใครโอนให้ใคร
  const creditors = going.filter(m => owes[m.id] > 0.01).map(m => ({ ...m, amount: owes[m.id] }))
  const debtors = going.filter(m => owes[m.id] < -0.01).map(m => ({ ...m, amount: Math.abs(owes[m.id]) }))

  const transfers: { from: string; to: string; amount: number }[] = []
  const creds = creditors.map(c => ({ ...c }))
  const debts = debtors.map(d => ({ ...d }))

  let i = 0, j = 0
  while (i < creds.length && j < debts.length) {
    const amount = Math.min(creds[i].amount, debts[j].amount)
    transfers.push({ from: debts[j].name, to: creds[i].name, amount })
    creds[i].amount -= amount
    debts[j].amount -= amount
    if (creds[i].amount < 0.01) i++
    if (debts[j].amount < 0.01) j++
  }

  return (
    <>
      {/* สรุปยอดรวม */}
      <div className="bg-gray-800 rounded-2xl p-4 mt-6">
        <h2 className="font-semibold mb-1">🧮 สรุปค่าใช้จ่าย</h2>
        <p className="text-gray-400 text-sm mb-3">รวม ฿{totalAmount.toLocaleString()} | คนละ ฿{perPerson.toFixed(2)}</p>
        {going.map(m => {
          const balance = owes[m.id] || 0
          const isOwed = balance > 0
          const isOwing = balance < 0
          return (
            <div key={m.id} className="flex justify-between py-2 border-b border-gray-700">
              <span>{m.name}</span>
              <span className={isOwed ? 'text-green-400' : isOwing ? 'text-red-400' : 'text-gray-400'}>
                {isOwed && `+฿${balance.toFixed(2)} (คนอื่นค้างจ่าย)`}
                {isOwing && `-฿${Math.abs(balance).toFixed(2)} (ต้องจ่ายเพิ่ม)`}
                {!isOwed && !isOwing && 'เสมอกัน ✅'}
              </span>
            </div>
          )
        })}
      </div>

      {/* ใครโอนให้ใคร */}
      <div className="bg-gray-800 rounded-2xl p-4 mt-6">
        <h2 className="font-semibold mb-3">💸 ใครต้องโอนให้ใคร</h2>
        {transfers.length === 0 && <p className="text-gray-500">ยังไม่มีหนี้ หรือเสมอกันหมดแล้ว ✅</p>}
        {transfers.map((t, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-medium">{t.from}</span>
              <span className="text-gray-400">→</span>
              <span className="text-green-400 font-medium">{t.to}</span>
            </div>
            <span className="text-yellow-400 font-bold">฿{t.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </>
  )
}