import { useState } from 'react'
import { format, parseISO, isToday } from 'date-fns'
import { Utensils, Plus, Trash2, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react'
import type { FoodEntry, FoodRisk } from '../types'

const RISK_CONFIG: Record<FoodRisk, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  safe: { label: 'Safe', color: 'text-green-700', bg: 'bg-green-50 border-green-200', Icon: ShieldCheck },
  caution: { label: 'Caution', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', Icon: AlertCircle },
  risky: { label: 'Risky', color: 'text-red-700', bg: 'bg-red-50 border-red-200', Icon: AlertTriangle },
}

const COMMON_RISKY_FOODS = [
  'Dairy', 'Gluten', 'Spicy food', 'Raw vegetables', 'Cruciferous veg',
  'Beans/legumes', 'Nuts', 'Seeds', 'Alcohol', 'Coffee', 'Fried food',
  'Red meat', 'Artificial sweeteners', 'High-fiber foods', 'Carbonated drinks',
]

interface Props {
  entries: FoodEntry[]
  onAdd: (entry: FoodEntry) => void
  onDelete: (id: string) => void
}

export default function FoodLog({ entries, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [risk, setRisk] = useState<FoodRisk>('safe')
  const [notes, setNotes] = useState('')
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date()
    return `${format(now, 'yyyy-MM-dd')}T${format(now, 'HH:mm')}`
  })

  const todayEntries = entries.filter(e => isToday(parseISO(e.timestamp)))
  const todayRisky = todayEntries.filter(e => e.risk === 'risky').length

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      timestamp: new Date(timestamp).toISOString(),
      name: name.trim(),
      risk,
      notes,
    })
    setName('')
    setNotes('')
    setRisk('safe')
    setShowForm(false)
    setTimestamp(`${format(new Date(), 'yyyy-MM-dd')}T${format(new Date(), 'HH:mm')}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Food & Diet</h2>
        <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={() => setShowForm(v => !v)}>
          <Plus size={16} /> Log Food
        </button>
      </div>

      {/* Today summary */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Utensils size={24} className="text-sky-500 shrink-0" />
          <div>
            <p className="font-semibold text-slate-700">{todayEntries.length} items logged today</p>
            {todayRisky > 0 ? (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertTriangle size={13} /> {todayRisky} risky item{todayRisky > 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <ShieldCheck size={13} /> No risky foods today
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-3">Log Food</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Food / Drink *</label>
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Greek yogurt, Coffee, Salad..."
                required
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {COMMON_RISKY_FOODS.map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setName(f)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Risk Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(RISK_CONFIG) as [FoodRisk, typeof RISK_CONFIG[FoodRisk]][]).map(([value, config]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRisk(value)}
                    className={`p-2.5 rounded-lg border-2 text-center transition-all ${
                      risk === value ? `${config.bg} border-current ${config.color}` : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <config.Icon size={18} className="mx-auto mb-1" />
                    <span className="text-xs font-medium">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Time</label>
              <input type="datetime-local" className="input" value={timestamp} onChange={e => setTimestamp(e.target.value)} />
            </div>

            <div>
              <label className="label">Notes</label>
              <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Portion size, how you felt after..." />
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Entry list */}
      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-center text-slate-400 py-8">No food entries yet.</p>
        )}
        {entries
          .slice()
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map(entry => {
            const config = RISK_CONFIG[entry.risk]
            return (
              <div key={entry.id} className={`card border flex items-start gap-3 ${config.bg}`}>
                <config.Icon size={18} className={`shrink-0 mt-0.5 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800">{entry.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${config.color} ${config.bg} border ${config.bg.replace('bg-', 'border-').replace('50', '200')}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{format(parseISO(entry.timestamp), 'MMM d, h:mm a')}</p>
                  {entry.notes && <p className="text-xs text-slate-500 italic mt-0.5">{entry.notes}</p>}
                </div>
                <button onClick={() => onDelete(entry.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
      </div>
    </div>
  )
}
