import { useState } from 'react'
import { format, parseISO, isToday } from 'date-fns'
import { Dumbbell, Plus, Trash2, Flame } from 'lucide-react'
import type { WorkoutEntry, WorkoutIntensity } from '../types'

const INTENSITY_CONFIG: Record<WorkoutIntensity, { label: string; color: string; bg: string }> = {
  light: { label: 'Light', color: 'text-green-700', bg: 'bg-green-100' },
  moderate: { label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-100' },
  intense: { label: 'Intense', color: 'text-red-700', bg: 'bg-red-100' },
}

const WORKOUT_TYPES = [
  'Walking', 'Running', 'Cycling', 'Swimming', 'Yoga', 'Pilates',
  'Weight training', 'HIIT', 'Stretching', 'Rowing', 'Elliptical', 'Other',
]

interface Props {
  entries: WorkoutEntry[]
  onAdd: (entry: WorkoutEntry) => void
  onDelete: (id: string) => void
}

export default function WorkoutLog({ entries, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('')
  const [duration, setDuration] = useState(30)
  const [intensity, setIntensity] = useState<WorkoutIntensity>('moderate')
  const [notes, setNotes] = useState('')
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date()
    return `${format(now, 'yyyy-MM-dd')}T${format(now, 'HH:mm')}`
  })

  const todayEntries = entries.filter(e => isToday(parseISO(e.timestamp)))
  const todayMinutes = todayEntries.reduce((s, e) => s + e.duration, 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      timestamp: new Date(timestamp).toISOString(),
      type: type.trim(),
      duration,
      intensity,
      notes,
    })
    setType('')
    setDuration(30)
    setIntensity('moderate')
    setNotes('')
    setShowForm(false)
    setTimestamp(`${format(new Date(), 'yyyy-MM-dd')}T${format(new Date(), 'HH:mm')}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Workouts</h2>
        <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={() => setShowForm(v => !v)}>
          <Plus size={16} /> Log Workout
        </button>
      </div>

      {/* Summary */}
      <div className="card flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center border-2 border-orange-200 shrink-0">
          <Dumbbell size={24} className="text-orange-500" />
        </div>
        <div>
          <p className="font-semibold text-slate-700">
            {todayMinutes > 0 ? (
              <><span className="text-orange-600">{todayMinutes} min</span> today</>
            ) : (
              'No workout logged today'
            )}
          </p>
          <p className="text-sm text-slate-500">{entries.length} workouts total</p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-3">Log Workout</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Activity *</label>
              <input
                className="input"
                value={type}
                onChange={e => setType(e.target.value)}
                placeholder="e.g. Running, Yoga..."
                required
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {WORKOUT_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      type === t ? 'bg-sky-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Duration: <span className="font-bold text-slate-800">{duration} min</span></label>
              <input
                type="range"
                min={5}
                max={180}
                step={5}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>5 min</span>
                <span>1 hour</span>
                <span>3 hours</span>
              </div>
            </div>

            <div>
              <label className="label">Intensity</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(INTENSITY_CONFIG) as [WorkoutIntensity, typeof INTENSITY_CONFIG[WorkoutIntensity]][]).map(([value, config]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setIntensity(value)}
                    className={`p-2.5 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                      intensity === value
                        ? `${config.bg} ${config.color} border-current`
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Flame size={16} className="mx-auto mb-1" />
                    {config.label}
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
              <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did you feel? Any symptoms?" />
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
        <p className="text-center text-slate-400 py-8">No workout entries yet.</p>
      )}

      {entries.length > 0 && (() => {
        const todayKey = format(new Date(), 'yyyy-MM-dd')
        const groups = new Map<string, typeof entries>()
        entries
          .slice()
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .forEach(entry => {
            const key = format(parseISO(entry.timestamp), 'yyyy-MM-dd')
            if (!groups.has(key)) groups.set(key, [])
            groups.get(key)!.push(entry)
          })
        return Array.from(groups.entries()).map(([dateKey, dayEntries]) => (
          <div key={dateKey}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {dateKey === todayKey ? 'Today' : format(parseISO(dateKey), 'EEE, MMM d')}
            </p>
            <div className="space-y-2">
              {dayEntries.map(entry => {
                const config = INTENSITY_CONFIG[entry.intensity]
                return (
                  <div key={entry.id} className="card flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                      <Dumbbell size={18} className={config.color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800">{entry.type}</p>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {entry.duration} min · {format(parseISO(entry.timestamp), 'h:mm a')}
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
