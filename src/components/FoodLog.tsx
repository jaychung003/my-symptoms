import { useState, useEffect } from 'react'
import { format, parseISO, isToday } from 'date-fns'
import { Utensils, Plus, Trash2, AlertTriangle, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react'
import type { FoodEntry, FoodRisk } from '../types'
import { classifyFood } from '../lib/foodClassifier'

const RISK_CONFIG: Record<FoodRisk, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  safe:    { label: 'Safe',    color: 'text-green-700', bg: 'bg-green-50',  border: 'border-green-200', Icon: ShieldCheck },
  caution: { label: 'Caution', color: 'text-amber-700', bg: 'bg-amber-50',  border: 'border-amber-200', Icon: AlertCircle },
  risky:   { label: 'Risky',   color: 'text-red-700',   bg: 'bg-red-50',    border: 'border-red-200',   Icon: AlertTriangle },
}

const QUICK_ADDS = [
  'Coffee', 'White rice', 'Banana', 'Chicken breast', 'Salmon',
  'Broccoli', 'Beer', 'Yogurt', 'Eggs', 'Spicy food',
  'French fries', 'Oatmeal', 'Apple', 'Pasta', 'Red meat',
]

interface Props {
  entries: FoodEntry[]
  onAdd: (entry: FoodEntry) => void
  onDelete: (id: string) => void
}

export default function FoodLog({ entries, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [classification, setClassification] = useState<{ risk: FoodRisk; reason: string } | null>(null)
  const [overrideRisk, setOverrideRisk] = useState<FoodRisk | null>(null)
  const [notes, setNotes] = useState('')
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date()
    return `${format(now, 'yyyy-MM-dd')}T${format(now, 'HH:mm')}`
  })

  // Auto-classify whenever name changes (debounced)
  useEffect(() => {
    setOverrideRisk(null)
    if (!name.trim()) {
      setClassification(null)
      return
    }
    const t = setTimeout(() => {
      setClassification(classifyFood(name))
    }, 300)
    return () => clearTimeout(t)
  }, [name])

  const effectiveRisk: FoodRisk = overrideRisk ?? classification?.risk ?? 'caution'
  const config = RISK_CONFIG[effectiveRisk]

  const todayEntries = entries.filter(e => isToday(parseISO(e.timestamp)))
  const todayRisky = todayEntries.filter(e => e.risk === 'risky').length

  function handleQuickAdd(food: string) {
    setName(food)
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      timestamp: new Date(timestamp).toISOString(),
      name: name.trim(),
      risk: effectiveRisk,
      notes: notes.trim() || (classification?.reason ?? ''),
    })
    setName('')
    setNotes('')
    setClassification(null)
    setOverrideRisk(null)
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

      {/* Quick-add chips */}
      {!showForm && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick add</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ADDS.map(food => {
              const { risk } = classifyFood(food)
              const c = RISK_CONFIG[risk]
              return (
                <button
                  key={food}
                  onClick={() => handleQuickAdd(food)}
                  className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${c.bg} ${c.border} ${c.color}`}
                >
                  {food}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Food name input */}
            <div>
              <label className="label">What did you eat or drink?</label>
              <input
                className="input text-base"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Greek yogurt, Coffee, Grilled salmon..."
                autoFocus
                required
              />
            </div>

            {/* AI classification result */}
            {classification && name.trim() && (
              <div className={`rounded-lg p-3 border ${config.bg} ${config.border}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={13} className={config.color} />
                  <span className={`text-xs font-semibold uppercase tracking-wide ${config.color}`}>
                    Auto-detected: {config.label}
                  </span>
                </div>
                {classification.reason && (
                  <p className={`text-xs ${config.color} opacity-80`}>{classification.reason}</p>
                )}
                {/* Override buttons */}
                <div className="flex gap-1.5 mt-2">
                  <span className="text-xs text-slate-400 self-center">Override:</span>
                  {(Object.entries(RISK_CONFIG) as [FoodRisk, typeof RISK_CONFIG[FoodRisk]][]).map(([value, c]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setOverrideRisk(overrideRisk === value ? null : value)}
                      className={`text-xs px-2 py-0.5 rounded border transition-all ${
                        effectiveRisk === value && overrideRisk === value
                          ? `${c.bg} ${c.border} ${c.color} font-semibold`
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time — collapsed by default */}
            <details className="text-sm">
              <summary className="cursor-pointer text-slate-400 hover:text-slate-600 text-xs select-none">
                Adjust time (optional)
              </summary>
              <div className="mt-2">
                <input type="datetime-local" className="input" value={timestamp} onChange={e => setTimestamp(e.target.value)} />
              </div>
            </details>

            {/* Notes — collapsed by default */}
            <details className="text-sm">
              <summary className="cursor-pointer text-slate-400 hover:text-slate-600 text-xs select-none">
                Add notes (optional)
              </summary>
              <div className="mt-2">
                <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Portion size, how you felt after..." />
              </div>
            </details>

            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setName(''); setClassification(null) }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={!name.trim()}>
                Save
              </button>
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
            const c = RISK_CONFIG[entry.risk]
            return (
              <div key={entry.id} className={`card border flex items-start gap-3 ${c.bg} ${c.border}`}>
                <c.Icon size={18} className={`shrink-0 mt-0.5 ${c.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-800">{entry.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium border ${c.bg} ${c.border} ${c.color}`}>
                      {c.label}
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
