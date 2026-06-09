import { useState } from 'react'
import { format, parseISO, subDays } from 'date-fns'
import { Moon, Plus, Trash2, Star } from 'lucide-react'
import type { SleepEntry, SleepQuality } from '../types'

const QUALITY_CONFIG: Record<SleepQuality, { label: string; color: string; stars: number }> = {
  poor: { label: 'Poor', color: 'text-red-500', stars: 1 },
  fair: { label: 'Fair', color: 'text-amber-500', stars: 2 },
  good: { label: 'Good', color: 'text-green-500', stars: 3 },
  excellent: { label: 'Excellent', color: 'text-sky-500', stars: 4 },
}

function calcHours(bedtime: string, wakeTime: string): number {
  if (!bedtime || !wakeTime) return 0
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let minutes = (wh * 60 + wm) - (bh * 60 + bm)
  if (minutes < 0) minutes += 24 * 60
  return Math.round((minutes / 60) * 10) / 10
}

function hoursColor(h: number) {
  if (h >= 7.5) return 'text-green-600'
  if (h >= 6) return 'text-amber-500'
  return 'text-red-500'
}

interface Props {
  entries: SleepEntry[]
  onAdd: (entry: SleepEntry) => void
  onDelete: (id: string) => void
}

export default function SleepLog({ entries, onAdd, onDelete }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(today)
  const [bedtime, setBedtime] = useState('22:30')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [quality, setQuality] = useState<SleepQuality>('good')
  const [interruptions, setInterruptions] = useState(0)
  const [notes, setNotes] = useState('')

  const hours = calcHours(bedtime, wakeTime)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      id: crypto.randomUUID(),
      date,
      bedtime,
      wakeTime,
      hours,
      quality,
      interruptions,
      notes,
    })
    setNotes('')
    setInterruptions(0)
    setShowForm(false)
  }

  const recentAvg = entries.length > 0
    ? (entries.slice(-7).reduce((s, e) => s + e.hours, 0) / Math.min(entries.length, 7)).toFixed(1)
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Sleep</h2>
        <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={() => setShowForm(v => !v)}>
          <Plus size={16} /> Log Sleep
        </button>
      </div>

      {/* Summary */}
      <div className="card flex gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 border-2 border-indigo-200 shrink-0">
          <Moon size={24} className="text-indigo-500" />
        </div>
        <div>
          {recentAvg ? (
            <>
              <p className="font-semibold text-slate-700">
                <span className={hoursColor(Number(recentAvg))}>{recentAvg}h</span> avg (last 7 nights)
              </p>
              <p className="text-sm text-slate-500">{entries.length} nights logged total</p>
            </>
          ) : (
            <p className="text-slate-500">No sleep data yet</p>
          )}
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-3">Log Sleep</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Night of</label>
              <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} max={today} />
              <div className="flex gap-2 mt-1.5">
                {[{ label: 'Last night', val: yesterday }, { label: 'Tonight', val: today }].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setDate(opt.val)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      date === opt.val ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Bedtime</label>
                <input type="time" className="input" value={bedtime} onChange={e => setBedtime(e.target.value)} />
              </div>
              <div>
                <label className="label">Wake time</label>
                <input type="time" className="input" value={wakeTime} onChange={e => setWakeTime(e.target.value)} />
              </div>
            </div>

            {hours > 0 && (
              <div className={`text-center font-semibold text-lg ${hoursColor(hours)}`}>
                {hours} hours of sleep
              </div>
            )}

            <div>
              <label className="label">Quality</label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.entries(QUALITY_CONFIG) as [SleepQuality, typeof QUALITY_CONFIG[SleepQuality]][]).map(([value, config]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setQuality(value)}
                    className={`p-2 rounded-lg border-2 text-center transition-all text-xs font-medium ${
                      quality === value
                        ? `border-current ${config.color} bg-slate-50`
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-center gap-0.5 mb-1">
                      {Array.from({ length: config.stars }).map((_, i) => (
                        <Star key={i} size={8} className="fill-current" />
                      ))}
                    </div>
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Interruptions: <span className="font-bold text-slate-800">{interruptions}</span></label>
              <input
                type="range"
                min={0}
                max={10}
                value={interruptions}
                onChange={e => setInterruptions(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="label">Notes</label>
              <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Restless, vivid dreams, night sweats..." />
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Entry list grouped by day */}
      {entries.length === 0 && (
        <p className="text-center text-slate-400 py-8">No sleep entries yet.</p>
      )}

      {entries.length > 0 && (() => {
        const groups = new Map<string, typeof entries>()
        entries
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .forEach(entry => {
            if (!groups.has(entry.date)) groups.set(entry.date, [])
            groups.get(entry.date)!.push(entry)
          })
        return Array.from(groups.entries()).map(([dateKey, dayEntries]) => (
          <div key={dateKey}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {dateKey === today ? 'Today' : format(parseISO(dateKey + 'T12:00:00'), 'EEE, MMM d')}
            </p>
            <div className="space-y-2">
              {dayEntries.map(entry => {
                const config = QUALITY_CONFIG[entry.quality]
                return (
                  <div key={entry.id} className="card flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <Moon size={18} className="text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${hoursColor(entry.hours)}`}>{entry.hours}h</span>
                        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {entry.bedtime} → {entry.wakeTime}
                        {entry.interruptions > 0 && ` · ${entry.interruptions} wake-up${entry.interruptions > 1 ? 's' : ''}`}
                      </p>
                      {entry.notes && <p className="text-xs text-slate-400 italic mt-0.5">{entry.notes}</p>}
                    </div>
                    <button onClick={() => onDelete(entry.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      })()}
    </div>
  )
}
