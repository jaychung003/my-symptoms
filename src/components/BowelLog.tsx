import { useState } from 'react'
import { format, parseISO, isToday, subMinutes, subHours } from 'date-fns'
import { Droplets, Plus, Trash2, AlertCircle, Clock } from 'lucide-react'
import type { BowelMovement, BristolScale, BloodLevel, PainLevel } from '../types'

const TIME_SHORTCUTS = [
  { label: 'Just now', offset: () => new Date() },
  { label: '15 min ago', offset: () => subMinutes(new Date(), 15) },
  { label: '30 min ago', offset: () => subMinutes(new Date(), 30) },
  { label: '1 hr ago', offset: () => subHours(new Date(), 1) },
  { label: '2 hrs ago', offset: () => subHours(new Date(), 2) },
]

function toLocalInput(d: Date) {
  return `${format(d, 'yyyy-MM-dd')}T${format(d, 'HH:mm')}`
}

const BRISTOL_DESCRIPTIONS: Record<BristolScale, { label: string; color: string; desc: string }> = {
  1: { label: 'Type 1', color: 'bg-amber-900 text-white', desc: 'Separate hard lumps' },
  2: { label: 'Type 2', color: 'bg-amber-700 text-white', desc: 'Lumpy sausage shape' },
  3: { label: 'Type 3', color: 'bg-amber-600 text-white', desc: 'Cracked sausage shape' },
  4: { label: 'Type 4', color: 'bg-green-600 text-white', desc: 'Smooth, soft sausage' },
  5: { label: 'Type 5', color: 'bg-yellow-500 text-white', desc: 'Soft blobs, clear edges' },
  6: { label: 'Type 6', color: 'bg-orange-500 text-white', desc: 'Fluffy, mushy pieces' },
  7: { label: 'Type 7', color: 'bg-red-500 text-white', desc: 'Watery, liquid' },
}

const BLOOD_LEVELS: { value: BloodLevel; label: string; color: string }[] = [
  { value: 'none', label: 'None', color: 'bg-slate-100 text-slate-600' },
  { value: 'trace', label: 'Trace', color: 'bg-pink-100 text-pink-700' },
  { value: 'mild', label: 'Mild', color: 'bg-red-100 text-red-600' },
  { value: 'moderate', label: 'Moderate', color: 'bg-red-200 text-red-700' },
  { value: 'severe', label: 'Severe', color: 'bg-red-500 text-white' },
]

function bloodColor(level: BloodLevel) {
  return BLOOD_LEVELS.find(b => b.value === level)?.color ?? ''
}

function painColor(level: number) {
  if (level <= 2) return 'bg-green-500'
  if (level <= 4) return 'bg-yellow-400'
  if (level <= 6) return 'bg-orange-400'
  if (level <= 8) return 'bg-red-400'
  return 'bg-red-600'
}

interface Props {
  entries: BowelMovement[]
  onAdd: (entry: BowelMovement) => void
  onDelete: (id: string) => void
}

export default function BowelLog({ entries, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [bristol, setBristol] = useState<BristolScale>(4)
  const [blood, setBlood] = useState<BloodLevel>('none')
  const [pain, setPain] = useState<PainLevel>(0)
  const [urgency, setUrgency] = useState(false)
  const [notes, setNotes] = useState('')
  const [timestamp, setTimestamp] = useState(() => toLocalInput(new Date()))
  const [showCustomTime, setShowCustomTime] = useState(false)
  const [activeShortcut, setActiveShortcut] = useState(0)

  const todayEntries = entries.filter(e => isToday(parseISO(e.timestamp)))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      id: crypto.randomUUID(),
      timestamp: new Date(timestamp).toISOString(),
      bristolScale: bristol,
      bloodLevel: blood,
      painLevel: pain,
      urgency,
      notes,
    })
    setShowForm(false)
    setNotes('')
    setPain(0)
    setBlood('none')
    setBristol(4)
    setUrgency(false)
    setTimestamp(toLocalInput(new Date()))
    setActiveShortcut(0)
    setShowCustomTime(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Bowel Movements</h2>
        <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={() => setShowForm(v => !v)}>
          <Plus size={16} />
          Log BM
        </button>
      </div>

      {/* Today summary */}
      <div className="card flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-sky-50 flex flex-col items-center justify-center border-2 border-sky-200">
          <span className="text-2xl font-bold text-sky-700">{todayEntries.length}</span>
        </div>
        <div>
          <p className="font-semibold text-slate-700">Today's count</p>
          {todayEntries.length > 0 && (
            <p className="text-sm text-slate-500">
              Avg pain: {(todayEntries.reduce((s, e) => s + e.painLevel, 0) / todayEntries.length).toFixed(1)} ·{' '}
              {todayEntries.some(e => e.bloodLevel !== 'none') ? (
                <span className="text-red-500">Blood detected</span>
              ) : (
                <span className="text-green-600">No blood</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-3">Log Bowel Movement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label flex items-center gap-1.5">
                <Clock size={13} /> When?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TIME_SHORTCUTS.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setActiveShortcut(i)
                      setTimestamp(toLocalInput(s.offset()))
                      setShowCustomTime(false)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      activeShortcut === i && !showCustomTime
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setShowCustomTime(v => !v); setActiveShortcut(-1) }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                    showCustomTime
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  Custom…
                </button>
              </div>
              {showCustomTime && (
                <input
                  type="datetime-local"
                  className="input mt-2"
                  value={timestamp}
                  onChange={e => setTimestamp(e.target.value)}
                />
              )}
              {!showCustomTime && (
                <p className="text-xs text-slate-400 mt-1">
                  <Clock size={10} className="inline mr-0.5" />
                  {format(new Date(timestamp), 'h:mm a')}
                </p>
              )}
            </div>

            <div>
              <label className="label">Bristol Stool Scale</label>
              <div className="grid grid-cols-7 gap-1">
                {([1, 2, 3, 4, 5, 6, 7] as BristolScale[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBristol(t)}
                    className={`rounded-lg p-2 text-center transition-all border-2 ${
                      bristol === t
                        ? `${BRISTOL_DESCRIPTIONS[t].color} border-transparent scale-105`
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-lg font-bold">{t}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                <span className={`inline-block px-2 py-0.5 rounded ${BRISTOL_DESCRIPTIONS[bristol].color}`}>
                  Type {bristol}
                </span>{' '}
                — {BRISTOL_DESCRIPTIONS[bristol].desc}
              </p>
            </div>

            <div>
              <label className="label">Blood</label>
              <div className="flex gap-2 flex-wrap">
                {BLOOD_LEVELS.map(b => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setBlood(b.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      blood === b.value ? `${b.color} border-transparent` : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Pain Level: <span className="font-bold text-slate-800">{pain}/10</span></label>
              <input
                type="range"
                min={0}
                max={10}
                value={pain}
                onChange={e => setPain(Number(e.target.value) as PainLevel)}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>None</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="urgency"
                checked={urgency}
                onChange={e => setUrgency(e.target.checked)}
                className="w-4 h-4 accent-sky-600"
              />
              <label htmlFor="urgency" className="text-sm text-slate-600 cursor-pointer">
                Urgent / couldn't wait
              </label>
            </div>

            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any additional details..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entry list */}
      {entries.length === 0 && (
        <p className="text-center text-slate-400 py-8">No entries yet. Log your first BM above.</p>
      )}

      {/* Today */}
      {todayEntries.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Today</p>
          <div className="space-y-2">
            {todayEntries
              .slice()
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map(entry => (
                <EntryCard key={entry.id} entry={entry} onDelete={onDelete} showDate={false} />
              ))}
          </div>
        </div>
      )}

      {/* Previous */}
      {entries.some(e => !isToday(parseISO(e.timestamp))) && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Previous</p>
          <div className="space-y-2">
            {entries
              .filter(e => !isToday(parseISO(e.timestamp)))
              .slice()
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map(entry => (
                <EntryCard key={entry.id} entry={entry} onDelete={onDelete} showDate={true} />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EntryCard({ entry, onDelete, showDate }: { entry: BowelMovement; onDelete: (id: string) => void; showDate: boolean }) {
  return (
        <div className="card flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${BRISTOL_DESCRIPTIONS[entry.bristolScale].color}`}>
            T{entry.bristolScale}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-700">
                {showDate
                  ? format(parseISO(entry.timestamp), 'EEE MMM d, h:mm a')
                  : format(parseISO(entry.timestamp), 'h:mm a')}
              </span>
              {entry.urgency && (
                <span className="flex items-center gap-0.5 text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                  <AlertCircle size={11} /> Urgent
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${bloodColor(entry.bloodLevel)}`}>
                <span className="flex items-center gap-1">
                  <Droplets size={11} /> {entry.bloodLevel === 'none' ? 'No blood' : `Blood: ${entry.bloodLevel}`}
                </span>
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-600">
                <div className={`w-2 h-2 rounded-full ${painColor(entry.painLevel)}`} />
                Pain {entry.painLevel}/10
              </span>
              <span className="text-xs text-slate-400">{BRISTOL_DESCRIPTIONS[entry.bristolScale].desc}</span>
            </div>
            {entry.notes && <p className="text-xs text-slate-500 mt-1 italic">{entry.notes}</p>}
          </div>
          <button
            onClick={() => onDelete(entry.id)}
            className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
            aria-label="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
  )
}

